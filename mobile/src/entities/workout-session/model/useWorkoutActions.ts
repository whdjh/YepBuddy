import { useCallback, type Dispatch } from "react"
import { clearCurrentWorkoutSnapshot } from "./sessionStorage"
import type {
  BodyPart,
  BodyPartDetail,
  WorkoutBodyPartSet,
  WorkoutLiveStats,
  WorkoutLocation,
} from "./types"
import type { RoutinePart } from "./routineCycle"
import type { WorkoutAction } from "./workoutState"

/** 화면이 reducer dispatch를 직접 다루지 않도록 운동 액션 API 제공 */
export function useWorkoutActions(dispatch: Dispatch<WorkoutAction>) {
  const startCountdown = useCallback(() => {
    dispatch({ type: "START_COUNTDOWN" })
  }, [dispatch])

  const startRecording = useCallback(() => {
    const startedAt = new Date().toISOString()
    const sessionId = startedAt
    dispatch({
      type: "START_RECORDING",
      payload: { sessionId, startedAt },
    })
    return { sessionId, startedAt }
  }, [dispatch])

  const setLocation = useCallback(
    (location: WorkoutLocation | null) => {
      dispatch({ type: "SET_LOCATION", payload: location })
    },
    [dispatch],
  )

  const setLiveStats = useCallback(
    (stats: WorkoutLiveStats) => {
      dispatch({ type: "SET_LIVE_STATS", payload: stats })
    },
    [dispatch],
  )

  const toggleBodyPart = useCallback(
    (part: BodyPart) => {
      dispatch({ type: "TOGGLE_BODY_PART", payload: part })
    },
    [dispatch],
  )

  const toggleBodyPartDetail = useCallback(
    (part: BodyPart, detail: BodyPartDetail) => {
      dispatch({ type: "TOGGLE_BODY_PART_DETAIL", payload: { part, detail } })
    },
    [dispatch],
  )

  const updateSetCount = useCallback(
    (part: BodyPart, setCount: number, detail?: BodyPartDetail) => {
      dispatch({
        type: "UPDATE_SET_COUNT",
        payload: { part, detail, setCount },
      })
    },
    [dispatch],
  )

  const updateMemo = useCallback(
    (memo: string) => {
      dispatch({ type: "UPDATE_MEMO", payload: memo })
    },
    [dispatch],
  )

  const startCardio = useCallback(() => {
    dispatch({
      type: "START_CARDIO",
      payload: { cardioStartedAt: new Date().toISOString() },
    })
  }, [dispatch])

  const pauseWorkout = useCallback(() => {
    dispatch({ type: "PAUSE", payload: { pausedAt: new Date().toISOString() } })
  }, [dispatch])

  const resumeWorkout = useCallback(() => {
    dispatch({
      type: "RESUME",
      payload: { resumedAt: new Date().toISOString() },
    })
  }, [dispatch])

  const resetWorkout = useCallback(async () => {
    dispatch({ type: "RESET" })
    await clearCurrentWorkoutSnapshot()
  }, [dispatch])

  const applyBodyPartTemplate = useCallback(
    (parts: RoutinePart[]) => {
      dispatch({ type: "APPLY_BODY_PART_TEMPLATE", payload: parts })
    },
    [dispatch],
  )

  const applyBodyPartSets = useCallback(
    (bodyParts: WorkoutBodyPartSet[]) => {
      dispatch({ type: "APPLY_BODY_PART_SETS", payload: bodyParts })
    },
    [dispatch],
  )

  return {
    applyBodyPartSets,
    applyBodyPartTemplate,
    pauseWorkout,
    resetWorkout,
    resumeWorkout,
    setLiveStats,
    setLocation,
    startCardio,
    startCountdown,
    startRecording,
    toggleBodyPart,
    toggleBodyPartDetail,
    updateMemo,
    updateSetCount,
  }
}
