import ActivityKit
import AppIntents
import Foundation

@available(iOS 16.1, *)
// 운동 Live Activity 속성
struct WorkoutLiveActivityAttributes: ActivityAttributes {
  // Live Activity 동적 상태
  public struct ContentState: Codable, Hashable {
    var cardioStartedAt: Date?
    var heartRate: Int?
    var statusText: String
    var timerStartAt: Date
    var timerPausedAt: Date?
  }

  var sessionId: String
}

// Live Activity 운동 command
enum WorkoutLiveActivityCommand: String, Codable {
  case pause
  case resume
  case startCardio
  case finish
}

// Live Activity command 저장
enum WorkoutLiveActivityCommandQueue {
  private static let key = "yb:workout-live-activity:commands"

  private struct QueuedCommand: Codable {
    let command: WorkoutLiveActivityCommand
    let createdAt: String
    let id: String
    let sessionId: String
  }

  private static func nowIsoString() -> String {
    ISO8601DateFormatter().string(from: Date())
  }

  static func enqueue(_ command: WorkoutLiveActivityCommand, sessionId: String) {
    var commands = readCommands()
    commands.append(
      QueuedCommand(
        command: command,
        createdAt: nowIsoString(),
        id: UUID().uuidString,
        sessionId: sessionId
      )
    )

    if let data = try? JSONEncoder().encode(commands) {
      UserDefaults.standard.set(data, forKey: key)
    }
  }

  static func consume() -> [[String: String]] {
    let commands = readCommands()
    UserDefaults.standard.removeObject(forKey: key)

    return commands.map { command in
      [
        "command": command.command.rawValue,
        "createdAt": command.createdAt,
        "id": command.id,
        "sessionId": command.sessionId,
      ]
    }
  }

  private static func readCommands() -> [QueuedCommand] {
    guard let data = UserDefaults.standard.data(forKey: key),
      let commands = try? JSONDecoder().decode([QueuedCommand].self, from: data)
    else {
      return []
    }

    return commands
  }
}

// Live Activity command 실행
enum WorkoutLiveActivityCommandRunner {
  @available(iOS 16.2, *)
  private static func updateLiveActivity(
    command: WorkoutLiveActivityCommand,
    sessionId: String,
    now: Date
  ) async {
    for activity in Activity<WorkoutLiveActivityAttributes>.activities
    where activity.attributes.sessionId == sessionId {
      var state = activity.content.state

      switch command {
      case .pause:
        guard state.timerPausedAt == nil else {
          return
        }
        state.statusText = state.cardioStartedAt == nil ? "운동 일시정지" : "유산소 일시정지"
        state.timerPausedAt = now
      case .resume:
        guard let pausedAt = state.timerPausedAt else {
          return
        }
        state.statusText = state.cardioStartedAt == nil ? "운동 기록 중" : "유산소 기록 중"
        state.timerStartAt = state.timerStartAt.addingTimeInterval(
          now.timeIntervalSince(pausedAt)
        )
        state.timerPausedAt = nil
      case .startCardio:
        guard state.timerPausedAt == nil, state.cardioStartedAt == nil else {
          return
        }
        state.cardioStartedAt = now
        state.statusText = "유산소 기록 중"
      case .finish:
        await activity.end(nil, dismissalPolicy: .immediate)
        continue
      }

      await activity.update(ActivityContent(state: state, staleDate: nil))
    }
  }

  static func perform(command: WorkoutLiveActivityCommand, sessionId: String) async {
    let now = Date()
    WorkoutLiveActivityCommandQueue.enqueue(command, sessionId: sessionId)

    #if !WORKOUT_LIVE_ACTIVITY_EXTENSION
      switch command {
      case .pause:
        _ = LiveWorkoutSessionController.shared.pause()
      case .resume:
        _ = LiveWorkoutSessionController.shared.resume()
      case .startCardio:
        break
      case .finish:
        break
      }
    #endif

    guard #available(iOS 16.2, *) else {
      return
    }

    await updateLiveActivity(command: command, sessionId: sessionId, now: now)
  }
}

@available(iOS 17.0, *)
// Live Activity 유산소 시작 intent
struct StartCardioWorkoutLiveActivityIntent: LiveActivityIntent {
  static var title: LocalizedStringResource = "유산소 시작"

  @Parameter(title: "Session ID")
  var sessionId: String

  init() {}

  init(sessionId: String) {
    self.sessionId = sessionId
  }

  func perform() async throws -> some IntentResult {
    await WorkoutLiveActivityCommandRunner.perform(
      command: .startCardio,
      sessionId: sessionId
    )
    return .result()
  }
}

@available(iOS 17.0, *)
// Live Activity 일시정지 intent
struct PauseWorkoutLiveActivityIntent: LiveActivityIntent {
  static var title: LocalizedStringResource = "운동중지"

  @Parameter(title: "Session ID")
  var sessionId: String

  init() {}

  init(sessionId: String) {
    self.sessionId = sessionId
  }

  func perform() async throws -> some IntentResult {
    await WorkoutLiveActivityCommandRunner.perform(
      command: .pause,
      sessionId: sessionId
    )
    return .result()
  }
}

@available(iOS 17.0, *)
// Live Activity 재개 intent
struct ResumeWorkoutLiveActivityIntent: LiveActivityIntent {
  static var title: LocalizedStringResource = "재개"

  @Parameter(title: "Session ID")
  var sessionId: String

  init() {}

  init(sessionId: String) {
    self.sessionId = sessionId
  }

  func perform() async throws -> some IntentResult {
    await WorkoutLiveActivityCommandRunner.perform(
      command: .resume,
      sessionId: sessionId
    )
    return .result()
  }
}

@available(iOS 17.0, *)
// Live Activity 운동 종료 intent
struct FinishWorkoutLiveActivityIntent: LiveActivityIntent {
  static var title: LocalizedStringResource = "운동종료"

  @Parameter(title: "Session ID")
  var sessionId: String

  init() {}

  init(sessionId: String) {
    self.sessionId = sessionId
  }

  func perform() async throws -> some IntentResult {
    await WorkoutLiveActivityCommandRunner.perform(
      command: .finish,
      sessionId: sessionId
    )
    return .result()
  }
}
