import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
} from "react"
import { useDebouncedEffect } from "@/shared/hooks/useDebouncedEffect"
import {
  clearCurrentWorkoutSnapshot,
  loadCurrentWorkoutSnapshot,
  saveCurrentWorkoutSnapshot,
} from "./currentWorkoutStorage"
import type { WorkoutAction, WorkoutState } from "./workoutState"

/** 진행 중 운동의 저장소 복구와 변경 상태 snapshot 저장 관리 */
export function useWorkoutPersistence({
  dispatch,
  state,
}: {
  dispatch: Dispatch<WorkoutAction>
  state: WorkoutState
}) {
  const [isHydrated, setIsHydrated] = useState(false)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const saveRecoverableWorkoutSnapshot = useCallback(() => {
    const nextState = stateRef.current

    if (nextState.phase === "idle" || nextState.phase === "completed") {
      void clearCurrentWorkoutSnapshot()
      return
    }

    void saveCurrentWorkoutSnapshot(nextState)
  }, [])

  useEffect(() => {
    let mounted = true

    void loadCurrentWorkoutSnapshot<WorkoutState>().then((snapshot) => {
      if (!mounted) {
        return
      }

      if (snapshot) {
        dispatch({ type: "HYDRATE", payload: snapshot })
      }
      setIsHydrated(true)
    })

    return () => {
      mounted = false
    }
  }, [dispatch])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    saveRecoverableWorkoutSnapshot()
  }, [
    isHydrated,
    saveRecoverableWorkoutSnapshot,
    state.bodyParts,
    state.cardioStartedAt,
    state.completedAt,
    state.location,
    state.pausedAt,
    state.pausedDuration,
    state.phase,
    state.sessionId,
    state.startedAt,
  ])

  useDebouncedEffect(
    () => {
      if (isHydrated) {
        saveRecoverableWorkoutSnapshot()
      }
    },
    1000,
    [isHydrated, saveRecoverableWorkoutSnapshot, state.memo],
  )

  return isHydrated
}
