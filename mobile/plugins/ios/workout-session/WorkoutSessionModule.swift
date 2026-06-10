import Foundation
import React
import UIKit

@objc(WorkoutSession)
final class WorkoutSessionModule: RCTEventEmitter {
  private let controller = LiveWorkoutSessionController.shared
  private var hasListeners = false

  override init() {
    super.init()

    controller.onStats = { [weak self] stats in
      self?.emitEvent(WorkoutSessionPayload.statsEventName, body: stats)
    }
    controller.onSessionState = { [weak self] state in
      self?.emitEvent(WorkoutSessionPayload.sessionStateEventName, body: state)
    }

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleAppWillTerminate),
      name: UIApplication.willTerminateNotification,
      object: nil
    )
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
    controller.discardLiveWorkoutForShutdown()
  }

  /// React Native 메인 큐 요구 여부
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    false
  }

  /// 지원 이벤트 목록
  override func supportedEvents() -> [String]! {
    [
      WorkoutSessionPayload.statsEventName,
      WorkoutSessionPayload.sessionStateEventName,
    ]
  }

  /// JS listener 등록 상태 시작
  override func startObserving() {
    hasListeners = true
  }

  /// JS listener 등록 상태 종료
  override func stopObserving() {
    hasListeners = false
  }

  /// 앱 종료 정리
  @objc
  private func handleAppWillTerminate() {
    controller.discardLiveWorkoutForShutdown()
  }

  /// 라이브 운동 시작
  @objc(start:rejecter:)
  func start(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    controller.start(
      resolve: { resolve($0) },
      reject: { code, message, error in reject(code, message, error) }
    )
  }

  /// 라이브 운동 일시정지
  @objc(pause:rejecter:)
  func pause(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(controller.pause())
  }

  /// 라이브 운동 재개
  @objc(resume:rejecter:)
  func resume(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(controller.resume())
  }

  /// 라이브 운동 저장 종료
  @objc(end:rejecter:)
  func end(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    controller.end(
      resolve: { resolve($0) },
      reject: { code, message, error in reject(code, message, error) }
    )
  }

  /// 라이브 운동 폐기 종료
  @objc(discard:rejecter:)
  func discard(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    controller.discard(
      resolve: { resolve($0) },
      reject: { code, message, error in reject(code, message, error) }
    )
  }

  /// 운동 Live Activity 표시 시작
  @objc(startLiveActivity:cardioStartedAt:statusText:timerStartAt:timerPausedAt:resolver:rejecter:)
  func startLiveActivity(
    _ sessionId: String,
    cardioStartedAt: String?,
    statusText: String,
    timerStartAt: String,
    timerPausedAt: String?,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      let started = await WorkoutLiveActivityController.start(
        sessionId: sessionId,
        cardioStartedAt: cardioStartedAt,
        statusText: statusText,
        timerStartAt: timerStartAt,
        timerPausedAt: timerPausedAt
      )
      resolve(started)
    }
  }

  /// 운동 Live Activity 표시 종료
  @objc(endLiveActivity:rejecter:)
  func endLiveActivity(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      await WorkoutLiveActivityController.endAll()
      resolve(true)
    }
  }

  /// Live Activity 액션 command 소비
  @objc(consumeLiveActivityCommands:rejecter:)
  func consumeLiveActivityCommands(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(WorkoutLiveActivityCommandQueue.consume())
  }

  /// 라이브 stats 조회
  @objc(readLiveStats:rejecter:)
  func readLiveStats(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(controller.readLiveStats())
  }

  /// 저장된 HealthKit workout 상세 조회
  @objc(readWorkoutDetail:resolver:rejecter:)
  func readWorkoutDetail(
    _ sessionId: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    controller.readWorkoutDetail(
      sessionId: sessionId,
      resolve: { resolve($0) },
      reject: { code, message, error in reject(code, message, error) }
    )
  }

  private func emitEvent(_ name: String, body: [String: Any]) {
    guard hasListeners else {
      return
    }

    sendEvent(withName: name, body: body)
  }
}
