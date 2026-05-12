import Foundation
import HealthKit
import React

// React Native YBWorkoutSession 모듈 브리지
@objc(YBWorkoutSession)
final class YBWorkoutSession: RCTEventEmitter {
  private let healthStore = HKHealthStore()
  // iOS 26 전용 API 구체 타입 캐스팅 경계
  private var liveSession: AnyObject?
  private var liveBuilder: AnyObject?
  private var hasListeners = false
  // end() 비동기 완료 promise 보관
  private var pendingEndResolve: RCTPromiseResolveBlock?
  private var pendingEndReject: RCTPromiseRejectBlock?

  @objc
  override static func requiresMainQueueSetup() -> Bool {
    false
  }

  override func supportedEvents() -> [String]! {
    ["workoutStatsChanged", "workoutSessionStateChanged"]
  }

  override func startObserving() {
    // JS listener 등록 이후 이벤트 발행
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  @objc(start:rejecter:)
  func start(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // HealthKit 미지원 런타임 사전 차단
    guard HKHealthStore.isHealthDataAvailable() else {
      reject("healthkit_unavailable", "HealthKit is not available on this device.", nil)
      return
    }

    guard #available(iOS 26.0, *) else {
      reject("workout_session_unavailable", "Live workout sessions require iOS 26 or later.", nil)
      return
    }

    log("YBWorkoutSession.start requested")
    startLiveWorkout(resolve, rejecter: reject)
  }

  @objc(pause:rejecter:)
  func pause(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // 미지원/미시작 상태 false 응답 계약
    guard #available(iOS 26.0, *) else {
      resolve(false)
      return
    }

    guard let session = liveSession as? HKWorkoutSession else {
      resolve(false)
      return
    }

    session.pause()
    resolve(true)
  }

  @objc(resume:rejecter:)
  func resume(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // pause와 동일한 no-op 응답 계약
    guard #available(iOS 26.0, *) else {
      resolve(false)
      return
    }

    guard let session = liveSession as? HKWorkoutSession else {
      resolve(false)
      return
    }

    session.resume()
    resolve(true)
  }

  @objc(end:rejecter:)
  func end(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 26.0, *) else {
      resolve(false)
      return
    }

    guard
      let session = liveSession as? HKWorkoutSession,
      liveBuilder is HKLiveWorkoutBuilder
    else {
      clearLiveWorkout()
      resolve(false)
      return
    }

    pendingEndResolve = resolve
    pendingEndReject = reject

    let endDate = Date()
    emitSessionState("ending")
    // .stopped delegate 상태 기반 저장/정리
    session.stopActivity(with: endDate)
  }

  @objc(readLiveStats:rejecter:)
  func readLiveStats(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard #available(iOS 26.0, *) else {
      resolve(emptyStats(isRunning: false, status: "idle"))
      return
    }

    guard let builder = liveBuilder as? HKLiveWorkoutBuilder else {
      resolve(emptyStats(isRunning: false, status: "idle"))
      return
    }

    resolve(
      buildStatsPayload(
        from: builder,
        status: "waitingSensor",
        errorCode: "heart_rate_not_available"
      )
    )
  }

  private func nowIsoString() -> String {
    ISO8601DateFormatter().string(from: Date())
  }

  private func log(_ message: String, details: Any? = nil) {
    if let details {
      NSLog("[HealthKit] \(message): \(details)")
      return
    }

    NSLog("[HealthKit] \(message)")
  }

  private func emitEvent(_ name: String, body: [String: Any]) {
    guard hasListeners else {
      return
    }

    sendEvent(withName: name, body: body)
  }

  @available(iOS 26.0, *)
  private func emitStats(
    from builder: HKLiveWorkoutBuilder,
    status: String,
    errorCode: String? = nil
  ) {
    let stats = buildStatsPayload(
      from: builder,
      status: status,
      errorCode: errorCode
    )
    emitEvent("workoutStatsChanged", body: stats)
  }

  @available(iOS 26.0, *)
  private func buildStatsPayload(
    from builder: HKLiveWorkoutBuilder,
    status: String,
    errorCode: String? = nil
  ) -> [String: Any] {
    var stats = readStats(from: builder, isRunning: liveSession != nil)
    let hasHeartRate = !(stats["heartRate"] is NSNull)
    stats["source"] = "iphoneLiveWorkout"
    // 심박 센서 미수집 상태의 waiting/error payload
    stats["status"] = hasHeartRate ? "live" : status
    stats["updatedAt"] = nowIsoString()
    if let errorCode, !hasHeartRate {
      stats["errorCode"] = errorCode
    } else {
      stats["errorCode"] = NSNull()
    }
    return stats
  }

  private func emitSessionState(_ state: String, errorCode: String? = nil) {
    emitEvent("workoutSessionStateChanged", body: [
      "source": "iphoneLiveWorkout",
      "state": state,
      "updatedAt": nowIsoString(),
      "errorCode": errorCode as Any? ?? NSNull(),
    ])
  }

  @available(iOS 26.0, *)
  private func startLiveWorkout(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if liveSession != nil {
      // 중복 start 호출의 현재 builder 상태 재발행
      if let builder = liveBuilder as? HKLiveWorkoutBuilder {
        emitStats(
          from: builder,
          status: "waitingSensor",
          errorCode: "heart_rate_not_available"
        )
      }
      resolve([
        "started": true,
        "source": "iphoneLiveWorkout",
        "status": "waitingSensor",
      ])
      return
    }

    requestHealthKitAuthorization { [weak self] success, error in
      guard let self else {
        reject("workout_session_released", "Workout session module was released.", nil)
        return
      }

      guard success else {
        self.emitSessionState("error", errorCode: "healthkit_authorization_failed")
        self.log("HealthKit authorization failed", details: error?.localizedDescription ?? "unknown")
        reject(
          "healthkit_authorization_failed",
          error?.localizedDescription ?? "HealthKit authorization failed.",
          error
        )
        return
      }

      do {
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = .traditionalStrengthTraining
        configuration.locationType = .indoor

        let session = try HKWorkoutSession(
          healthStore: self.healthStore,
          configuration: configuration
        )
        let builder = session.associatedWorkoutBuilder()
        let dataSource = HKLiveWorkoutDataSource(
          healthStore: self.healthStore,
          workoutConfiguration: configuration
        )

        session.delegate = self
        builder.delegate = self

        // UI 표시용 실시간 quantity 수집 대상
        [
          HKQuantityType.quantityType(forIdentifier: .heartRate),
          HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned),
          HKQuantityType.quantityType(forIdentifier: .basalEnergyBurned),
        ]
          .compactMap { $0 }
          .forEach { dataSource.enableCollection(for: $0, predicate: nil) }

        builder.shouldCollectWorkoutEvents = true
        builder.dataSource = dataSource

        self.liveSession = session
        self.liveBuilder = builder

        let startDate = Date()
        session.prepare()
        self.emitSessionState("starting")
        self.log("YBWorkoutSession.prepare requested", details: startDate)

        // prepare 이후 HealthKit 세션 전환 안정화 대기
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) { [weak self] in
          guard let self else {
            reject("workout_session_released", "Workout session module was released.", nil)
            return
          }

          session.startActivity(with: startDate)
          self.log("YBWorkoutSession.startActivity requested", details: startDate)

          builder.beginCollection(withStart: startDate) { [weak self] collectionStarted, collectionError in
            guard collectionStarted else {
              self?.clearLiveWorkout()
              self?.emitSessionState("error", errorCode: "begin_collection_failed")
              self?.log(
                "YBWorkoutSession.beginCollection failed",
                details: collectionError?.localizedDescription ?? "unknown"
              )
              reject(
                "workout_session_start_failed",
                collectionError?.localizedDescription ?? "Failed to start live workout collection.",
                collectionError
              )
              return
            }

            self?.emitStats(
              from: builder,
              status: "waitingSensor",
              errorCode: "heart_rate_not_available"
            )
            self?.log("YBWorkoutSession.beginCollection succeeded", details: startDate)
            resolve([
              "started": true,
              "source": "iphoneLiveWorkout",
              "status": "waitingSensor",
            ])
          }
        }
      } catch {
        self.clearLiveWorkout()
        self.emitSessionState("error", errorCode: "workout_session_start_failed")
        self.log("YBWorkoutSession.start failed", details: error.localizedDescription)
        reject("workout_session_start_failed", error.localizedDescription, error)
      }
    }
  }

  @available(iOS 26.0, *)
  func workoutBuilder(
    _ workoutBuilder: HKLiveWorkoutBuilder,
    didCollectDataOf collectedTypes: Set<HKSampleType>
  ) {
    let hasQuantityType = collectedTypes.contains { sampleType in
      sampleType is HKQuantityType
    }
    guard hasQuantityType else {
      return
    }

    // 새 quantity sample 기반 최신 합산 값 발행
    emitStats(from: workoutBuilder, status: "live")
  }

  @available(iOS 26.0, *)
  func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {
    emitStats(from: workoutBuilder, status: "live")
  }

  @available(iOS 26.0, *)
  func workoutSession(
    _ workoutSession: HKWorkoutSession,
    didChangeTo toState: HKWorkoutSessionState,
    from fromState: HKWorkoutSessionState,
    date: Date
  ) {
    log("YBWorkoutSession state changed", details: [
      "from": fromState.rawValue,
      "to": toState.rawValue,
      "date": date,
    ])

    switch toState {
    // running 진입 직후 심박 센서 대기 상태 발행
    case .running:
      if let builder = liveBuilder as? HKLiveWorkoutBuilder {
        emitStats(
          from: builder,
          status: "waitingSensor",
          errorCode: "heart_rate_not_available"
        )
      }
    case .paused:
      if let builder = liveBuilder as? HKLiveWorkoutBuilder {
        emitStats(from: builder, status: "paused")
      }
    // stopActivity 결과 상태의 collection 종료 및 workout 저장
    case .stopped:
      finishStoppedWorkout(at: date)
    case .ended:
      emitSessionState("ended")
    default:
      emitSessionState("state_\(toState.rawValue)")
    }
  }

  @available(iOS 26.0, *)
  func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
    log("YBWorkoutSession failed", details: error.localizedDescription)
    emitSessionState("error", errorCode: "workout_session_failed")
    pendingEndReject?("workout_session_failed", error.localizedDescription, error)
    pendingEndResolve = nil
    pendingEndReject = nil
    clearLiveWorkout()
  }

  @available(iOS 26.0, *)
  private func requestHealthKitAuthorization(
    completion: @escaping (Bool, Error?) -> Void
  ) {
    // live 표시용 read 권한 및 workout 저장용 share 권한
    var readTypes = Set<HKObjectType>()
    if let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) {
      readTypes.insert(heartRateType)
    }
    if let activeEnergyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned) {
      readTypes.insert(activeEnergyType)
    }
    if let basalEnergyType = HKQuantityType.quantityType(forIdentifier: .basalEnergyBurned) {
      readTypes.insert(basalEnergyType)
    }
    readTypes.insert(HKObjectType.workoutType())

    let shareTypes: Set<HKSampleType> = [HKObjectType.workoutType()]

    log("HealthKit authorization requested")
    healthStore.requestAuthorization(
      toShare: shareTypes,
      read: readTypes
    ) { [weak self] success, error in
      self?.log("HealthKit authorization completed", details: [
        "success": success,
        "error": error?.localizedDescription ?? NSNull(),
      ])
      completion(success, error)
    }
  }

  @available(iOS 26.0, *)
  private func finishStoppedWorkout(at endDate: Date) {
    guard
      let session = liveSession as? HKWorkoutSession,
      let builder = liveBuilder as? HKLiveWorkoutBuilder
    else {
      pendingEndResolve?(false)
      pendingEndResolve = nil
      pendingEndReject = nil
      clearLiveWorkout()
      return
    }

    // HealthKit collection 종료, workout 저장, session 종료 순서
    builder.endCollection(withEnd: endDate) { [weak self] success, error in
      guard let self else {
        return
      }

      guard success else {
        self.emitSessionState("error", errorCode: "end_collection_failed")
        self.pendingEndReject?(
          "workout_session_end_failed",
          error?.localizedDescription ?? "Failed to end live workout collection.",
          error
        )
        self.pendingEndResolve = nil
        self.pendingEndReject = nil
        self.clearLiveWorkout()
        return
      }

      builder.finishWorkout { workout, finishError in
        if let finishError {
          self.emitSessionState("error", errorCode: "finish_workout_failed")
          self.pendingEndReject?(
            "workout_finish_failed",
            finishError.localizedDescription,
            finishError
          )
          self.pendingEndResolve = nil
          self.pendingEndReject = nil
          self.clearLiveWorkout()
          return
        }

        session.end()
        self.emitSessionState("ended")
        self.pendingEndResolve?([
          "ended": true,
          "source": "iphoneLiveWorkout",
          "status": "ended",
          "workoutUUID": workout?.uuid.uuidString as Any? ?? NSNull(),
        ])
        self.pendingEndResolve = nil
        self.pendingEndReject = nil
        self.clearLiveWorkout()
      }
    }
  }

  @available(iOS 26.0, *)
  private func readStats(
    from builder: HKLiveWorkoutBuilder,
    isRunning: Bool
  ) -> [String: Any] {
    let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)
    let activeEnergyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)
    let basalEnergyType = HKQuantityType.quantityType(forIdentifier: .basalEnergyBurned)
    let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
    let kcalUnit = HKUnit.kilocalorie()

    // heartRate 최근값 및 칼로리 세션 누적값
    let heartRate = heartRateType
      .flatMap { builder.statistics(for: $0)?.mostRecentQuantity() }
      .map { Int(round($0.doubleValue(for: bpmUnit))) }
    let activeKcal = activeEnergyType
      .flatMap { builder.statistics(for: $0)?.sumQuantity() }
      .map { Int(round($0.doubleValue(for: kcalUnit))) } ?? 0
    let basalKcal = basalEnergyType
      .flatMap { builder.statistics(for: $0)?.sumQuantity() }
      .map { Int(round($0.doubleValue(for: kcalUnit))) } ?? 0

    return [
      "heartRate": heartRate as Any? ?? NSNull(),
      "activeKcal": activeKcal,
      "totalKcal": activeKcal + basalKcal,
      "isRunning": isRunning,
    ]
  }

  private func emptyStats(
    isRunning: Bool,
    status: String,
    errorCode: String? = nil
  ) -> [String: Any] {
    [
      "heartRate": NSNull(),
      "activeKcal": 0,
      "totalKcal": 0,
      "isRunning": isRunning,
      "source": "iphoneLiveWorkout",
      "status": status,
      "updatedAt": nowIsoString(),
      "errorCode": errorCode as Any? ?? NSNull(),
    ]
  }

  private func clearLiveWorkout() {
    // 세션 종료/실패 후 delegate 참조 해제
    if #available(iOS 26.0, *) {
      (liveSession as? HKWorkoutSession)?.delegate = nil
      (liveBuilder as? HKLiveWorkoutBuilder)?.delegate = nil
    }
    liveSession = nil
    liveBuilder = nil
  }
}

@available(iOS 26.0, *)
extension YBWorkoutSession: HKWorkoutSessionDelegate, HKLiveWorkoutBuilderDelegate {}
