import ActivityKit
import Foundation

// 운동 Live Activity 제어
enum WorkoutLiveActivityController {
  @available(iOS 16.2, *)
  // Live Activity 표시 상태
  private static func activityContent(statusText: String) -> ActivityContent<WorkoutLiveActivityAttributes.ContentState> {
    ActivityContent(
      state: WorkoutLiveActivityAttributes.ContentState(statusText: statusText),
      staleDate: nil
    )
  }

  // Live Activity 시작
  static func start(sessionId: String) async -> Bool {
    guard #available(iOS 16.2, *) else {
      return false
    }

    guard ActivityAuthorizationInfo().areActivitiesEnabled else {
      return false
    }

    let existingActivity = Activity<WorkoutLiveActivityAttributes>.activities.first {
      $0.attributes.sessionId == sessionId
    }

    if existingActivity != nil {
      return true
    }

    do {
      _ = try Activity.request(
        attributes: WorkoutLiveActivityAttributes(sessionId: sessionId),
        content: activityContent(statusText: "운동 기록 중"),
        pushType: nil
      )
      return true
    } catch {
      return false
    }
  }

  // Live Activity 종료
  static func endAll() async {
    guard #available(iOS 16.2, *) else {
      return
    }

    for activity in Activity<WorkoutLiveActivityAttributes>.activities {
      await activity.end(nil, dismissalPolicy: .immediate)
    }
  }
}
