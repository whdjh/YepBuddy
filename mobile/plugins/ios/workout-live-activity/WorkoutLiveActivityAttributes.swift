import ActivityKit
import Foundation

@available(iOS 16.1, *)
// 운동 Live Activity 속성
struct WorkoutLiveActivityAttributes: ActivityAttributes {
  // Live Activity 동적 상태
  public struct ContentState: Codable, Hashable {
    var statusText: String
    var timerStartAt: Date
    var timerPausedAt: Date?
  }

  var sessionId: String
}
