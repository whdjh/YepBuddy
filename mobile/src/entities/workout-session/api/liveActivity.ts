import { NativeModules, Platform } from "react-native"

interface NativeWorkoutSessionModule {
  /** Native에 쌓인 Live Activity action command 목록 소비 */
  consumeLiveActivityCommands?: () => Promise<NativeWorkoutLiveActivityCommand[]>
  /** 진행 중인 운동 Live Activity 종료 */
  endLiveActivity?: () => Promise<boolean>
  /** 진행 중인 운동 Live Activity 시작 또는 갱신 */
  startLiveActivity?: (
    sessionId: string,
    statusText: string,
    timerStartAt: string,
    timerPausedAt: string | null,
  ) => Promise<boolean>
}

export interface WorkoutLiveActivityCommand {
  /** 실행할 운동 제어 명령 */
  command: "pause" | "resume"
  /** command가 생성된 시각 */
  createdAt: string
  /** command 중복 처리를 피하기 위한 식별자 */
  id: string
  /** command가 적용될 운동 세션 ID */
  sessionId: string
}

interface NativeWorkoutLiveActivityCommand {
  /** Native에서 넘어온 운동 제어 명령 원본값 */
  command?: unknown
  /** Native에서 넘어온 command 생성 시각 원본값 */
  createdAt?: unknown
  /** Native에서 넘어온 command 식별자 원본값 */
  id?: unknown
  /** Native에서 넘어온 운동 세션 ID 원본값 */
  sessionId?: unknown
}

const nativeWorkoutSession =
  Platform.OS === "ios"
    ? (NativeModules.WorkoutSession as NativeWorkoutSessionModule | undefined)
    : undefined

/** Live Activity command 정규화 */
function normalizeLiveActivityCommand(
  command: NativeWorkoutLiveActivityCommand,
): WorkoutLiveActivityCommand | null {
  if (
    (command.command !== "pause" && command.command !== "resume") ||
    typeof command.createdAt !== "string" ||
    typeof command.id !== "string" ||
    typeof command.sessionId !== "string"
  ) {
    return null
  }

  return {
    command: command.command,
    createdAt: command.createdAt,
    id: command.id,
    sessionId: command.sessionId,
  }
}

/** 운동 Live Activity 시작 */
export async function startWorkoutLiveActivity(params: {
  sessionId: string
  statusText: string
  timerPausedAt: string | null
  timerStartAt: string
}) {
  if (typeof nativeWorkoutSession?.startLiveActivity !== "function") {
    return false
  }

  return nativeWorkoutSession
    .startLiveActivity(
      params.sessionId,
      params.statusText,
      params.timerStartAt,
      params.timerPausedAt,
    )
    .catch(() => false)
}

/** 운동 Live Activity 종료 */
export async function endWorkoutLiveActivity() {
  if (typeof nativeWorkoutSession?.endLiveActivity !== "function") {
    return false
  }

  return nativeWorkoutSession.endLiveActivity().catch(() => false)
}

/** Live Activity 액션 command 소비 */
export async function consumeWorkoutLiveActivityCommands() {
  if (
    typeof nativeWorkoutSession?.consumeLiveActivityCommands !== "function"
  ) {
    return []
  }

  const commands = await nativeWorkoutSession
    .consumeLiveActivityCommands()
    .catch(() => [])

  return commands
    .map(normalizeLiveActivityCommand)
    .filter((command): command is WorkoutLiveActivityCommand => command !== null)
}
