import ActivityKit
import Foundation

// 운동 Live Activity 제어
enum WorkoutLiveActivityController {
  @available(iOS 16.2, *)
  // Live Activity 표시 상태
  private static func activityContent(
    cardioStartedAt: Date?,
    heartRate: Int?,
    statusText: String,
    timerStartAt: Date,
    timerPausedAt: Date?
  ) -> ActivityContent<WorkoutLiveActivityAttributes.ContentState> {
    ActivityContent(
      state: WorkoutLiveActivityAttributes.ContentState(
        cardioStartedAt: cardioStartedAt,
        heartRate: heartRate.flatMap { $0 > 0 ? $0 : nil },
        statusText: statusText,
        timerStartAt: timerStartAt,
        timerPausedAt: timerPausedAt
      ),
      staleDate: nil
    )
  }

  private static func date(from iso: String) -> Date? {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let date = formatter.date(from: iso) {
      return date
    }

    formatter.formatOptions = [.withInternetDateTime]
    return formatter.date(from: iso)
  }

  // Live Activity 시작
  static func start(
    sessionId: String,
    cardioStartedAt: String?,
    heartRate: Int?,
    statusText: String,
    timerStartAt: String,
    timerPausedAt: String?
  ) async -> Bool {
    guard #available(iOS 16.2, *) else {
      return false
    }

    guard ActivityAuthorizationInfo().areActivitiesEnabled else {
      return false
    }

    guard let timerStartDate = date(from: timerStartAt) else {
      return false
    }
    let cardioStartedDate = cardioStartedAt.flatMap { date(from: $0) }
    let timerPausedDate = timerPausedAt.flatMap { date(from: $0) }
    let content = activityContent(
      cardioStartedAt: cardioStartedDate,
      heartRate: heartRate,
      statusText: statusText,
      timerStartAt: timerStartDate,
      timerPausedAt: timerPausedDate
    )

    let existingActivity = Activity<WorkoutLiveActivityAttributes>.activities.first {
      $0.attributes.sessionId == sessionId
    }

    if let existingActivity {
      await existingActivity.update(content)
      return true
    }

    do {
      _ = try Activity.request(
        attributes: WorkoutLiveActivityAttributes(sessionId: sessionId),
        content: content,
        pushType: nil
      )
      return true
    } catch {
      return false
    }
  }

  // 현재 심박수 갱신
  static func updateHeartRate(_ heartRate: Int) async {
    guard #available(iOS 16.2, *), heartRate > 0 else {
      return
    }

    for activity in Activity<WorkoutLiveActivityAttributes>.activities {
      var state = activity.content.state
      guard state.heartRate != heartRate else {
        continue
      }

      state.heartRate = heartRate
      await activity.update(ActivityContent(state: state, staleDate: nil))
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
