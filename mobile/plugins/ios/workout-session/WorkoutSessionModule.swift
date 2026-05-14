import Foundation
import React
import UIKit

@objc(WorkoutSession)
final class WorkoutSessionModule: RCTEventEmitter {
  private let controller = LiveWorkoutSessionController()
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

  /// 라이브 stats 조회
  @objc(readLiveStats:rejecter:)
  func readLiveStats(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    resolve(controller.readLiveStats())
  }

  private func emitEvent(_ name: String, body: [String: Any]) {
    guard hasListeners else {
      return
    }

    sendEvent(withName: name, body: body)
  }
}
