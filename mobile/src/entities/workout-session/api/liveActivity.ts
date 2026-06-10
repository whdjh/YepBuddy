import { NativeModules, Platform } from "react-native"

interface NativeWorkoutSessionModule {
  endLiveActivity?: () => Promise<boolean>
  startLiveActivity?: (
    sessionId: string,
    statusText: string,
    timerStartAt: string,
    timerPausedAt: string | null,
  ) => Promise<boolean>
}

const nativeWorkoutSession =
  Platform.OS === "ios"
    ? (NativeModules.WorkoutSession as NativeWorkoutSessionModule | undefined)
    : undefined

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
