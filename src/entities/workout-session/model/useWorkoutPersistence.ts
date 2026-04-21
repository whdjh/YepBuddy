import { useEffect, type Dispatch } from "react"
import { usePathname, useRouter } from "expo-router"
import { useDebouncedEffect } from "@/shared/hooks/useDebouncedEffect"
import {
  clearCurrentWorkoutSnapshot,
  loadCurrentWorkoutSnapshot,
  saveCurrentWorkoutSnapshot,
} from "./sessionStorage"
import type { WorkoutAction, WorkoutState } from "./workoutState"

interface UseWorkoutPersistenceParams {
  dispatch: Dispatch<WorkoutAction>
  isHydrated: boolean
  setIsHydrated: (value: boolean) => void
  state: WorkoutState
}

export function useWorkoutPersistence({
  dispatch,
  isHydrated,
  setIsHydrated,
  state,
}: UseWorkoutPersistenceParams) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // 앱 시작 시 진행 중 운동 스냅샷이 있으면 상태로 복구
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
  }, [dispatch, setIsHydrated])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const isRecoverable =
      state.phase === "recording" || state.phase === "paused"

    if (isRecoverable && pathname !== "/workout/active") {
      router.replace("/workout/active")
    }
  }, [isHydrated, pathname, router, state.phase])

  useDebouncedEffect(
    () => {
      if (!isHydrated) {
        return
      }

      // idle/completed 상태는 복구 대상이 아니므로 진행 중 스냅샷 삭제
      if (state.phase === "idle" || state.phase === "completed") {
        void clearCurrentWorkoutSnapshot()
        return
      }

      // 메모 입력 등으로 state가 연속 변경될 수 있으므로 마지막 상태만 저장
      void saveCurrentWorkoutSnapshot(state)
    },
    1000,
    [isHydrated, state],
  )
}
