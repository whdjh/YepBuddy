import ActivityKit
import SwiftUI
import WidgetKit

// 운동 Live Activity 색상 토큰
private extension Color {
  static let workoutBackground = Color(red: 0.137, green: 0.118, blue: 0.091)
  static let workoutPanel = Color(red: 0.235, green: 0.216, blue: 0.176).opacity(0.92)
  static let workoutAccent = Color(red: 0.769, green: 0.659, blue: 0.494)
}

// 운동 경과 시간
private struct WorkoutLiveActivityTimerText: View {
  let timerStartAt: Date
  let timerPausedAt: Date?

  var body: some View {
    if let timerPausedAt {
      Text(
        timerInterval: timerStartAt...Date.distantFuture,
        pauseTime: timerPausedAt,
        countsDown: false,
        showsHours: true
      )
    } else {
      Text(timerStartAt, style: .timer)
    }
  }
}

// 잠금화면 Live Activity 레이아웃
private struct WorkoutLiveActivityLockScreenView: View {
  let context: ActivityViewContext<WorkoutLiveActivityAttributes>

  var body: some View {
    VStack(alignment: .leading, spacing: 14) {
      Text("옙버디")
        .font(.caption.weight(.semibold))
        .foregroundStyle(.white.opacity(0.72))

      HStack(alignment: .center, spacing: 12) {
        VStack(alignment: .leading, spacing: 5) {
          Text(context.state.statusText)
            .font(.headline.weight(.semibold))
            .foregroundStyle(.white)

          WorkoutLiveActivityTimerText(
            timerStartAt: context.state.timerStartAt,
            timerPausedAt: context.state.timerPausedAt
          )
            .font(.system(size: 34, weight: .semibold, design: .rounded))
            .monospacedDigit()
            .foregroundStyle(Color.workoutAccent)
        }

        Spacer(minLength: 12)

        Image(systemName: "figure.strengthtraining.traditional")
          .font(.title2.weight(.semibold))
          .foregroundStyle(Color.workoutAccent)
          .frame(width: 44, height: 44)
          .background(Color.workoutPanel, in: RoundedRectangle(cornerRadius: 8))
      }
    }
    .padding(18)
    .activityBackgroundTint(Color.workoutBackground)
    .activitySystemActionForegroundColor(Color.workoutAccent)
  }
}

// 운동 Live Activity 위젯
struct WorkoutLiveActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: WorkoutLiveActivityAttributes.self) { context in
      WorkoutLiveActivityLockScreenView(context: context)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Text("옙버디")
            .font(.caption.weight(.semibold))
        }

        DynamicIslandExpandedRegion(.trailing) {
          Image(systemName: "figure.strengthtraining.traditional")
            .foregroundStyle(Color.workoutAccent)
        }

        DynamicIslandExpandedRegion(.bottom) {
          HStack {
            Text(context.state.statusText)
            WorkoutLiveActivityTimerText(
              timerStartAt: context.state.timerStartAt,
              timerPausedAt: context.state.timerPausedAt
            )
              .monospacedDigit()
          }
          .font(.subheadline.weight(.medium))
        }
      } compactLeading: {
        Image(systemName: "figure.strengthtraining.traditional")
          .foregroundStyle(Color.workoutAccent)
      } compactTrailing: {
        Text("운동")
          .font(.caption2.weight(.semibold))
      } minimal: {
        Image(systemName: "figure.strengthtraining.traditional")
          .foregroundStyle(Color.workoutAccent)
      }
      .keylineTint(Color.workoutAccent)
    }
  }
}

@main
// Widget extension 진입점
struct WorkoutLiveActivityExtensionBundle: WidgetBundle {
  var body: some Widget {
    WorkoutLiveActivityWidget()
  }
}
