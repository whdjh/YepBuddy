import { useCallback, type Dispatch } from "react"
import {
  clearCurrentWorkoutSnapshot,
  saveCompletedWorkoutSession,
} from "./sessionStorage"
import type {
  BodyPart,
  StoredWorkoutSession,
  WorkoutLiveStats,
  WorkoutLocation,
} from "./types"
import type { WorkoutAction, WorkoutState } from "./workoutState"

interface UseWorkoutActionsParams {
  dispatch: Dispatch<WorkoutAction>
  state: WorkoutState
}

export function useWorkoutActions({
  dispatch,
  state,
}: UseWorkoutActionsParams) {
  // 기본 상태 전이, 화면이 dispatch 구조를 직접 알지 않아도 되도록 도메인 함수
  const startCountdown = useCallback(() => {
    dispatch({ type: "START_COUNTDOWN" })
  }, [dispatch])

  // 실제 운동 시작 액션, 시작 시각을 만들고 같은 값을 sessionId로도 사용
  const startRecording = useCallback(() => {
    const startedAt = new Date().toISOString()
    const sessionId = startedAt
    dispatch({
      type: "START_RECORDING",
      payload: { sessionId, startedAt },
    })
    return { sessionId, startedAt }
  }, [dispatch])

  // 위치/실시간 수치/사용자 입력을 상태에 반영하는 액션 묶음
  const setLocation = useCallback((location: WorkoutLocation | null) => {
    dispatch({ type: "SET_LOCATION", payload: location })
  }, [dispatch])

  const setLiveStats = useCallback((stats: WorkoutLiveStats) => {
    dispatch({ type: "SET_LIVE_STATS", payload: stats })
  }, [dispatch])

  const toggleBodyPart = useCallback((part: BodyPart) => {
    dispatch({ type: "TOGGLE_BODY_PART", payload: part })
  }, [dispatch])

  const updateSetCount = useCallback((part: BodyPart, setCount: number) => {
    dispatch({
      type: "UPDATE_SET_COUNT",
      payload: { part, setCount },
    })
  }, [dispatch])

  const updateMemo = useCallback((memo: string) => {
    dispatch({ type: "UPDATE_MEMO", payload: memo })
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

  // 운동 종료 워크플로우, reducer 상태 완료 처리 + 완료 세션 저장 + 진행 중 스냅샷 정리를 함께 수행
  const completeWorkout = useCallback(async () => {
    if (!state.sessionId || !state.startedAt) {
      return null
    }

    const completedAt = new Date().toISOString()
    dispatch({ type: "COMPLETE", payload: { completedAt } })

    const session: StoredWorkoutSession = {
      sessionId: state.sessionId,
      startedAt: state.startedAt,
      completedAt,
      bodyParts: state.bodyParts,
      memo: state.memo,
      location: state.location,
    }

    await saveCompletedWorkoutSession(session)
    await clearCurrentWorkoutSnapshot()
    return session
  }, [dispatch, state])

  // 운동 플로우를 강제로 취소할 때 사용하는 초기화 액션
  const resetWorkout = useCallback(async () => {
    dispatch({ type: "RESET" })
    await clearCurrentWorkoutSnapshot()
  }, [dispatch])

  return {
    startCountdown,
    startRecording,
    setLocation,
    setLiveStats,
    toggleBodyPart,
    updateSetCount,
    updateMemo,
    pauseWorkout,
    resumeWorkout,
    completeWorkout,
    resetWorkout,
  }
}
