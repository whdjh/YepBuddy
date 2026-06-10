import { NativeModules, Platform } from "react-native"

interface NativeWorkoutSessionModule {
  endLiveActivity?: () => Promise<boolean>
  startLiveActivity?: (sessionId: string) => Promise<boolean>
}

const nativeWorkoutSession =
  Platform.OS === "ios"
    ? (NativeModules.WorkoutSession as NativeWorkoutSessionModule | undefined)
    : undefined

/** 운동 Live Activity 시작 */
export async function startWorkoutLiveActivity(sessionId: string) {
  if (typeof nativeWorkoutSession?.startLiveActivity !== "function") {
    return false
  }

  return nativeWorkoutSession.startLiveActivity(sessionId).catch(() => false)
}

/** 운동 Live Activity 종료 */
export async function endWorkoutLiveActivity() {
  if (typeof nativeWorkoutSession?.endLiveActivity !== "function") {
    return false
  }

  return nativeWorkoutSession.endLiveActivity().catch(() => false)
}
