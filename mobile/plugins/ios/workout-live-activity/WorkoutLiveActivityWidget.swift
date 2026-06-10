import ActivityKit
import SwiftUI
import WidgetKit

// 운동 Live Activity 색상 토큰
private extension Color {
  static let workoutBackground = Color(red: 0.137, green: 0.118, blue: 0.091)
  static let workoutPanel = Color(red: 0.235, green: 0.216, blue: 0.176).opacity(0.92)
  static let workoutAccent = Color(red: 0.769, green: 0.659, blue: 0.494)
  static let workoutDanger = Color(red: 0.91, green: 0.345, blue: 0.329)
  static let workoutDangerPanel = Color(red: 0.91, green: 0.345, blue: 0.329).opacity(0.16)
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

// 운동 액션 이미지 버튼
private struct WorkoutLiveActivityIconAction: View {
  let accessibilityLabel: String
  let background: Color
  let foreground: Color
  let systemName: String

  var body: some View {
    Image(systemName: systemName)
      .font(.system(size: 17, weight: .semibold))
      .foregroundStyle(foreground)
      .frame(width: 42, height: 42)
      .background(background, in: Circle())
      .accessibilityLabel(accessibilityLabel)
  }
}

// 잠금화면 Live Activity 레이아웃
private struct WorkoutLiveActivityLockScreenView: View {
  let context: ActivityViewContext<WorkoutLiveActivityAttributes>

  private var primaryActionSystemName: String {
    context.state.timerPausedAt == nil ? "pause.fill" : "play.fill"
  }

  private var primaryActionAccessibilityLabel: String {
    context.state.timerPausedAt == nil ? "운동중지" : "재개"
  }

  private var cardioAccessibilityLabel: String {
    context.state.cardioStartedAt == nil ? "유산소 시작" : "유산소 기록 중"
  }

  private var cardioBackground: Color {
    if context.state.cardioStartedAt == nil {
      return Color.workoutPanel
    }

    return Color.workoutAccent.opacity(0.22)
  }

  @ViewBuilder
  private var primaryAction: some View {
    let icon = WorkoutLiveActivityIconAction(
      accessibilityLabel: primaryActionAccessibilityLabel,
      background: Color.workoutPanel,
      foreground: Color.workoutAccent,
      systemName: primaryActionSystemName
    )

    if #available(iOSApplicationExtension 17.0, *) {
      if context.state.timerPausedAt == nil {
        Button(intent: PauseWorkoutLiveActivityIntent(sessionId: context.attributes.sessionId)) {
          icon
        }
        .buttonStyle(.plain)
      } else {
        Button(intent: ResumeWorkoutLiveActivityIntent(sessionId: context.attributes.sessionId)) {
          icon
        }
        .buttonStyle(.plain)
      }
    } else {
      icon
    }
  }

  @ViewBuilder
  private var cardioAction: some View {
    let icon = WorkoutLiveActivityIconAction(
      accessibilityLabel: cardioAccessibilityLabel,
      background: cardioBackground,
      foreground: Color.workoutAccent,
      systemName: "figure.run"
    )

    if #available(iOSApplicationExtension 17.0, *),
      context.state.cardioStartedAt == nil,
      context.state.timerPausedAt == nil
    {
      Button(intent: StartCardioWorkoutLiveActivityIntent(sessionId: context.attributes.sessionId)) {
        icon
      }
      .buttonStyle(.plain)
    } else {
      icon
        .opacity(context.state.cardioStartedAt == nil ? 0.48 : 1)
    }
  }

  var body: some View {
    HStack(alignment: .bottom, spacing: 16) {
      VStack(alignment: .leading, spacing: 5) {
        Text("옙버디")
          .font(.caption.weight(.semibold))
          .foregroundStyle(.white.opacity(0.62))

        VStack(alignment: .leading, spacing: 2) {
          Text(context.state.statusText)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.white)

          WorkoutLiveActivityTimerText(
            timerStartAt: context.state.timerStartAt,
            timerPausedAt: context.state.timerPausedAt
          )
            .font(.system(size: 34, weight: .semibold, design: .rounded))
            .monospacedDigit()
            .foregroundStyle(Color.workoutAccent)
        }
      }

      Spacer(minLength: 12)

      VStack(alignment: .trailing, spacing: 14) {
        cardioAction

        HStack(spacing: 10) {
          primaryAction

          WorkoutLiveActivityIconAction(
            accessibilityLabel: "운동종료",
            background: Color.workoutDangerPanel,
            foreground: Color.workoutDanger,
            systemName: "stop.fill"
          )
          .opacity(0.72)
        }
      }
    }
    .padding(.horizontal, 20)
    .padding(.vertical, 17)
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
