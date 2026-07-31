import { useMemo, type Dispatch } from "react"
import { clearCurrentWorkoutSnapshot } from "./currentWorkoutStorage"
import type {
  BodyPart,
  BodyPartDetail,
  WorkoutBodyPartSet,
  WorkoutLiveStats,
  WorkoutLocation,
} from "./types"
import type { RoutinePart } from "./routineCycle"
import type { WorkoutAction } from "./workoutState"

/** 화면이 reducer dispatch를 직접 다루지 않도록 안정된 운동 액션 API 제공 */
export function useWorkoutActions(dispatch: Dispatch<WorkoutAction>) {
  return useMemo(
    () => ({
      applyBodyPartSets: (bodyParts: WorkoutBodyPartSet[]) => {
        dispatch({ type: "APPLY_BODY_PART_SETS", payload: bodyParts })
      },
      applyBodyPartTemplate: (parts: RoutinePart[]) => {
        dispatch({ type: "APPLY_BODY_PART_TEMPLATE", payload: parts })
      },
      pauseWorkout: () => {
        dispatch({
          type: "PAUSE",
          payload: { pausedAt: new Date().toISOString() },
        })
      },
      resetWorkout: async () => {
        dispatch({ type: "RESET" })
        await clearCurrentWorkoutSnapshot()
      },
      resumeWorkout: () => {
        dispatch({
          type: "RESUME",
          payload: { resumedAt: new Date().toISOString() },
        })
      },
      setLiveStats: (stats: WorkoutLiveStats) => {
        dispatch({ type: "SET_LIVE_STATS", payload: stats })
      },
      setLocation: (location: WorkoutLocation | null) => {
        dispatch({ type: "SET_LOCATION", payload: location })
      },
      startCardio: () => {
        dispatch({
          type: "START_CARDIO",
          payload: { cardioStartedAt: new Date().toISOString() },
        })
      },
      startCountdown: () => {
        dispatch({ type: "START_COUNTDOWN" })
      },
      startRecording: () => {
        const startedAt = new Date().toISOString()
        const sessionId = startedAt
        dispatch({
          type: "START_RECORDING",
          payload: { sessionId, startedAt },
        })
        return { sessionId, startedAt }
      },
      toggleBodyPart: (part: BodyPart) => {
        dispatch({ type: "TOGGLE_BODY_PART", payload: part })
      },
      toggleBodyPartDetail: (part: BodyPart, detail: BodyPartDetail) => {
        dispatch({
          type: "TOGGLE_BODY_PART_DETAIL",
          payload: { part, detail },
        })
      },
      updateMemo: (memo: string) => {
        dispatch({ type: "UPDATE_MEMO", payload: memo })
      },
      updateSetCount: (
        part: BodyPart,
        setCount: number,
        detail?: BodyPartDetail,
      ) => {
        dispatch({
          type: "UPDATE_SET_COUNT",
          payload: { part, detail, setCount },
        })
      },
    }),
    [dispatch],
  )
}
