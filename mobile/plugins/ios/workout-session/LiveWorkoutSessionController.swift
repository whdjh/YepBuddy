import Foundation
import HealthKit

enum LiveWorkoutFinishMode {
  case discard
  case save
}

final class LiveWorkoutSessionController: NSObject {
  typealias Resolve = (Any) -> Void
  typealias Reject = (String, String, Error?) -> Void

  static let shared = LiveWorkoutSessionController()

  var onStats: (([String: Any]) -> Void)?
  var onSessionState: (([String: Any]) -> Void)?

  private let healthStore: HKHealthStore
  private let authorization: HealthKitWorkoutAuthorization
  private var liveSession: AnyObject?
  private var liveBuilder: AnyObject?
  private var pendingFinishMode: LiveWorkoutFinishMode = .save
  private var pendingEndResolve: Resolve?
  private var pendingEndReject: Reject?

  private override init() {
    let healthStore = HKHealthStore()
    self.healthStore = healthStore
    self.authorization = HealthKitWorkoutAuthorization(healthStore: healthStore)
    super.init()
  }

  /// 라이브 운동 시작
  func start(
    resolve: @escaping Resolve,
    reject: @escaping Reject
  ) {
    guard HKHealthStore.isHealthDataAvailable() else {
      reject("healthkit_unavailable", "HealthKit is not available on this device.", nil)
      return
    }

    guard #available(iOS 26.0, *) else {
      reject("workout_session_unavailable", "Live workout sessions require iOS 26 or later.", nil)
      return
    }

    log("WorkoutSession.start requested")
    startLiveWorkout(resolve: resolve, reject: reject)
  }

  /// 라이브 운동 일시정지
  func pause() -> Bool {
    guard #available(iOS 26.0, *) else {
      return false
    }

    guard let session = liveSession as? HKWorkoutSession else {
      return false
    }

    session.pause()
    return true
  }

  /// 라이브 운동 재개
  func resume() -> Bool {
    guard #available(iOS 26.0, *) else {
      return false
    }

    guard let session = liveSession as? HKWorkoutSession else {
      return false
    }

    session.resume()
    return true
  }

  /// 라이브 운동 저장 종료
  func end(
    resolve: @escaping Resolve,
    reject: @escaping Reject
  ) {
    finishLiveWorkout(mode: .save, resolve: resolve, reject: reject)
  }

  /// 라이브 운동 폐기 종료
  func discard(
    resolve: @escaping Resolve,
    reject: @escaping Reject
  ) {
    finishLiveWorkout(mode: .discard, resolve: resolve, reject: reject)
  }

  /// 라이브 stats 조회
  func readLiveStats() -> [String: Any] {
    guard #available(iOS 26.0, *) else {
      return WorkoutSessionPayload.makeEmptyStats(isRunning: false, status: "idle")
    }

    guard let builder = liveBuilder as? HKLiveWorkoutBuilder else {
      return WorkoutSessionPayload.makeEmptyStats(isRunning: false, status: "idle")
    }

    return WorkoutSessionPayload.makeLiveStats(
      from: builder,
      isRunning: liveSession != nil,
      status: "waitingSensor",
      errorCode: "heart_rate_not_available"
    )
  }

  /// 저장된 HealthKit workout 상세 조회
  func readWorkoutDetail(
    sessionId: String,
    resolve: @escaping Resolve,
    reject: @escaping Reject
  ) {
    guard HKHealthStore.isHealthDataAvailable() else {
      resolve(NSNull())
      return
    }

    guard let startedAt = ISO8601DateFormatter().date(from: sessionId),
      let endDate = Calendar.current.date(byAdding: .hour, value: 24, to: startedAt)
    else {
      resolve(NSNull())
      return
    }

    let predicate = HKQuery.predicateForSamples(
      withStart: startedAt,
      end: endDate,
      options: [.strictStartDate]
    )
    let sortDescriptor = NSSortDescriptor(
      key: HKSampleSortIdentifierStartDate,
      ascending: true
    )
    let query = HKSampleQuery(
      sampleType: HKObjectType.workoutType(),
      predicate: predicate,
      limit: HKObjectQueryNoLimit,
      sortDescriptors: [sortDescriptor]
    ) { [weak self] _, samples, error in
      if let error {
        reject("workout_detail_query_failed", error.localizedDescription, error)
        return
      }

      guard let self else {
        resolve(NSNull())
        return
      }

      let workout = (samples as? [HKWorkout])?
        .filter { $0.startDate >= startedAt }
        .min {
          abs($0.startDate.timeIntervalSince(startedAt)) <
            abs($1.startDate.timeIntervalSince(startedAt))
        }

      guard let workout else {
        resolve(NSNull())
        return
      }

      resolve(self.makeWorkoutDetailPayload(from: workout))
    }

    healthStore.execute(query)
  }

  /// 앱 종료 시 라이브 운동 폐기
  func discardLiveWorkoutForShutdown() {
    if #available(iOS 26.0, *) {
      (liveSession as? HKWorkoutSession)?.end()
      (liveBuilder as? HKLiveWorkoutBuilder)?.discardWorkout()
    }

    pendingEndResolve = nil
    pendingEndReject = nil
    pendingFinishMode = .save
    clearLiveWorkout()
  }

  private func log(_ message: String, details: Any? = nil) {
    if let details {
      NSLog("[HealthKit] \(message): \(details)")
      return
    }

    NSLog("[HealthKit] \(message)")
  }

  @available(iOS 26.0, *)
  private func emitStats(
    from builder: HKLiveWorkoutBuilder,
    status: String,
    errorCode: String? = nil
  ) {
    onStats?(
      WorkoutSessionPayload.makeLiveStats(
        from: builder,
        isRunning: liveSession != nil,
        status: status,
        errorCode: errorCode
      )
    )
  }

  private func emitSessionState(_ state: String, errorCode: String? = nil) {
    onSessionState?(WorkoutSessionPayload.makeSessionState(state, errorCode: errorCode))
  }

  private func averageHeartRate(from statisticsProvider: (HKQuantityType) -> HKStatistics?) -> Int? {
    guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate),
      let averageQuantity = statisticsProvider(heartRateType)?.averageQuantity()
    else {
      return nil
    }

    let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
    return Int(round(averageQuantity.doubleValue(for: bpmUnit)))
  }

  @available(iOS 26.0, *)
  private func averageHeartRate(from builder: HKLiveWorkoutBuilder) -> Int? {
    averageHeartRate { quantityType in builder.statistics(for: quantityType) }
  }

  private func averageHeartRate(from workout: HKWorkout) -> Int? {
    guard #available(iOS 16.0, *) else {
      return nil
    }

    return averageHeartRate { quantityType in workout.statistics(for: quantityType) }
  }

  private func quantityKcal(
    from statisticsProvider: (HKQuantityType) -> HKStatistics?,
    identifier: HKQuantityTypeIdentifier
  ) -> Int? {
    guard let quantityType = HKQuantityType.quantityType(forIdentifier: identifier),
      let sumQuantity = statisticsProvider(quantityType)?.sumQuantity()
    else {
      return nil
    }

    return Int(round(sumQuantity.doubleValue(for: HKUnit.kilocalorie())))
  }

  private func makeWorkoutDetailPayload(from workout: HKWorkout) -> [String: Any] {
    let activeKcal: Int?
    let basalKcal: Int?

    if #available(iOS 16.0, *) {
      activeKcal = quantityKcal(
        from: { quantityType in workout.statistics(for: quantityType) },
        identifier: .activeEnergyBurned
      )
      basalKcal = quantityKcal(
        from: { quantityType in workout.statistics(for: quantityType) },
        identifier: .basalEnergyBurned
      )
    } else {
      activeKcal = nil
      basalKcal = nil
    }

    let totalKcal = activeKcal.map { $0 + (basalKcal ?? 0) }
    let resolvedTotalKcal = totalKcal ?? activeKcal

    return [
      "activeKcal": activeKcal as Any? ?? NSNull(),
      "averageHeartRate": averageHeartRate(from: workout) as Any? ?? NSNull(),
      "duration": Int(round(workout.duration)),
      "totalKcal": resolvedTotalKcal as Any? ?? NSNull(),
      "workoutUUID": workout.uuid.uuidString,
    ]
  }

  @available(iOS 26.0, *)
  private func startLiveWorkout(
    resolve: @escaping Resolve,
    reject: @escaping Reject
  ) {
    if liveSession != nil {
      if let builder = liveBuilder as? HKLiveWorkoutBuilder {
        emitStats(
          from: builder,
          status: "waitingSensor",
          errorCode: "heart_rate_not_available"
        )
      }
      resolve(WorkoutSessionPayload.makeStartResult(status: "waitingSensor"))
      return
    }

    log("HealthKit authorization requested")
    authorization.request { [weak self] success, error in
      guard let self else {
        reject("workout_session_released", "Workout session module was released.", nil)
        return
      }

      self.log("HealthKit authorization completed", details: [
        "success": success,
        "error": error?.localizedDescription ?? NSNull(),
      ])

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

        HealthKitWorkoutAuthorization.liveQuantityTypes.forEach {
          dataSource.enableCollection(for: $0, predicate: nil)
        }

        builder.shouldCollectWorkoutEvents = true
        builder.dataSource = dataSource

        self.liveSession = session
        self.liveBuilder = builder

        let startDate = Date()
        session.prepare()
        self.emitSessionState("starting")
        self.log("WorkoutSession.prepare requested", details: startDate)

        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) { [weak self] in
          guard let self else {
            reject("workout_session_released", "Workout session module was released.", nil)
            return
          }

          session.startActivity(with: startDate)
          self.log("WorkoutSession.startActivity requested", details: startDate)

          builder.beginCollection(withStart: startDate) { [weak self] collectionStarted, collectionError in
            guard collectionStarted else {
              self?.clearLiveWorkout()
              self?.emitSessionState("error", errorCode: "begin_collection_failed")
              self?.log(
                "WorkoutSession.beginCollection failed",
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
            self?.log("WorkoutSession.beginCollection succeeded", details: startDate)
            resolve(WorkoutSessionPayload.makeStartResult(status: "waitingSensor"))
          }
        }
      } catch {
        self.clearLiveWorkout()
        self.emitSessionState("error", errorCode: "workout_session_start_failed")
        self.log("WorkoutSession.start failed", details: error.localizedDescription)
        reject("workout_session_start_failed", error.localizedDescription, error)
      }
    }
  }

  private func finishLiveWorkout(
    mode: LiveWorkoutFinishMode,
    resolve: @escaping Resolve,
    reject: @escaping Reject
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

    if pendingEndResolve != nil || pendingEndReject != nil {
      resolve(false)
      return
    }

    pendingFinishMode = mode
    pendingEndResolve = resolve
    pendingEndReject = reject

    emitSessionState("ending")
    session.end()
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
    log("WorkoutSession state changed", details: [
      "from": fromState.rawValue,
      "to": toState.rawValue,
      "date": date,
    ])

    switch toState {
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
    case .stopped:
      emitSessionState("stopped")
      workoutSession.end()
    case .ended:
      if pendingEndResolve != nil || pendingEndReject != nil {
        finishEndedWorkout(at: date)
      } else {
        emitSessionState("ended")
        clearLiveWorkout()
      }
    default:
      emitSessionState("state_\(toState.rawValue)")
    }
  }

  @available(iOS 26.0, *)
  func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
    log("WorkoutSession failed", details: error.localizedDescription)
    emitSessionState("error", errorCode: "workout_session_failed")
    pendingEndReject?("workout_session_failed", error.localizedDescription, error)
    pendingEndResolve = nil
    pendingEndReject = nil
    pendingFinishMode = .save
    clearLiveWorkout()
  }

  @available(iOS 26.0, *)
  private func finishEndedWorkout(at endDate: Date) {
    guard let builder = liveBuilder as? HKLiveWorkoutBuilder else {
      pendingEndResolve?(false)
      pendingEndResolve = nil
      pendingEndReject = nil
      pendingFinishMode = .save
      clearLiveWorkout()
      return
    }

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
        self.pendingFinishMode = .save
        self.clearLiveWorkout()
        return
      }

      if self.pendingFinishMode == .discard {
        builder.discardWorkout()
        self.emitSessionState("ended")
        self.pendingEndResolve?(WorkoutSessionPayload.makeEndResult(workoutUUID: nil))
        self.pendingEndResolve = nil
        self.pendingEndReject = nil
        self.pendingFinishMode = .save
        self.clearLiveWorkout()
        return
      }

      let averageHeartRate = self.averageHeartRate(from: builder)

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
          self.pendingFinishMode = .save
          self.clearLiveWorkout()
          return
        }

        self.emitSessionState("ended")
        self.pendingEndResolve?(
          WorkoutSessionPayload.makeEndResult(
            workoutUUID: workout?.uuid.uuidString,
            averageHeartRate: averageHeartRate
          )
        )
        self.pendingEndResolve = nil
        self.pendingEndReject = nil
        self.pendingFinishMode = .save
        self.clearLiveWorkout()
      }
    }
  }

  private func clearLiveWorkout() {
    if #available(iOS 26.0, *) {
      (liveSession as? HKWorkoutSession)?.delegate = nil
      (liveBuilder as? HKLiveWorkoutBuilder)?.delegate = nil
    }
    liveSession = nil
    liveBuilder = nil
  }
}

@available(iOS 26.0, *)
extension LiveWorkoutSessionController: HKWorkoutSessionDelegate, HKLiveWorkoutBuilderDelegate {}
