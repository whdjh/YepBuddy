import Foundation
import HealthKit

final class HealthKitWorkoutAuthorization {
  private let healthStore: HKHealthStore

  init(healthStore: HKHealthStore) {
    self.healthStore = healthStore
  }

  static var liveQuantityTypes: [HKQuantityType] {
    [
      HKQuantityType.quantityType(forIdentifier: .heartRate),
      HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned),
      HKQuantityType.quantityType(forIdentifier: .basalEnergyBurned),
    ].compactMap { $0 }
  }

  private static var readTypes: Set<HKObjectType> {
    var types = Set<HKObjectType>()
    liveQuantityTypes.forEach { types.insert($0) }
    types.insert(HKObjectType.workoutType())
    return types
  }

  private static var shareTypes: Set<HKSampleType> {
    [HKObjectType.workoutType()]
  }

  /// HealthKit 권한 요청
  func request(completion: @escaping (Bool, Error?) -> Void) {
    healthStore.requestAuthorization(
      toShare: Self.shareTypes,
      read: Self.readTypes,
      completion: completion
    )
  }
}
