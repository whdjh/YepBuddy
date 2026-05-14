import Foundation
import HealthKit

enum WorkoutSessionPayload {
  static let source = "iphoneLiveWorkout"
  static let statsEventName = "workoutStatsChanged"
  static let sessionStateEventName = "workoutSessionStateChanged"

  private static func nowIsoString() -> String {
    ISO8601DateFormatter().string(from: Date())
  }

  /// 빈 stats payload 생성
  static func makeEmptyStats(
    isRunning: Bool,
    status: String,
    errorCode: String? = nil
  ) -> [String: Any] {
    [
      "heartRate": NSNull(),
      "activeKcal": 0,
      "totalKcal": 0,
      "isRunning": isRunning,
      "source": source,
      "status": status,
      "updatedAt": nowIsoString(),
      "errorCode": errorCode as Any? ?? NSNull(),
    ]
  }

  /// 라이브 stats payload 생성
  @available(iOS 26.0, *)
  static func makeLiveStats(
    from builder: HKLiveWorkoutBuilder,
    isRunning: Bool,
    status: String,
    errorCode: String? = nil
  ) -> [String: Any] {
    var stats = readStats(from: builder, isRunning: isRunning)
    let hasHeartRate = !(stats["heartRate"] is NSNull)
    stats["source"] = source
    stats["status"] = hasHeartRate ? "live" : status
    stats["updatedAt"] = nowIsoString()
    if let errorCode, !hasHeartRate {
      stats["errorCode"] = errorCode
    } else {
      stats["errorCode"] = NSNull()
    }
    return stats
  }

  /// session state event payload 생성
  static func makeSessionState(
    _ state: String,
    errorCode: String? = nil
  ) -> [String: Any] {
    [
      "source": source,
      "state": state,
      "updatedAt": nowIsoString(),
      "errorCode": errorCode as Any? ?? NSNull(),
    ]
  }

  /// start promise 결과 payload 생성
  static func makeStartResult(status: String) -> [String: Any] {
    [
      "started": true,
      "source": source,
      "status": status,
    ]
  }

  /// end promise 결과 payload 생성
  static func makeEndResult(workoutUUID: String?) -> [String: Any] {
    [
      "ended": true,
      "source": source,
      "status": "ended",
      "workoutUUID": workoutUUID as Any? ?? NSNull(),
    ]
  }

  @available(iOS 26.0, *)
  private static func readStats(
    from builder: HKLiveWorkoutBuilder,
    isRunning: Bool
  ) -> [String: Any] {
    let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate)
    let activeEnergyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)
    let basalEnergyType = HKQuantityType.quantityType(forIdentifier: .basalEnergyBurned)
    let bpmUnit = HKUnit.count().unitDivided(by: HKUnit.minute())
    let kcalUnit = HKUnit.kilocalorie()

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
}
