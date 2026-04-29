import { useDebouncedEffect } from "@/shared/hooks/useDebouncedEffect"
import { usePathname, useRouter } from "expo-router"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type PropsWithChildren,
} from "react"
import {
  clearCurrentWorkoutSnapshot,
  loadCurrentWorkoutSnapshot,
  saveCompletedWorkoutSession,
  saveCurrentWorkoutSnapshot,
} from "./sessionStorage"
import type {
  BodyPart,
  BodyPartDetail,
  StoredWorkoutSession,
  WorkoutLiveStats,
  WorkoutLocation,
} from "./types"
import {
  initialWorkoutState,
  workoutReducer,
  type WorkoutState,
} from "./workoutState"

// useWorkout()으로 외부에 노출할 상태와 액션 목록
interface WorkoutContextValue {
  /** 현재 운동 상태 전체 */
  state: WorkoutState
  /** 저장된 진행 중 운동 복구가 끝났는지 여부 */
  isHydrated: boolean
  /** 새 운동 카운트다운 단계로 진입 */
  startCountdown: () => void
  /** 실제 운동 기록을 시작하고 sessionId, startedAt을 생성 */
  startRecording: () => { sessionId: string; startedAt: string }
  /** 현재 운동 위치를 저장 */
  setLocation: (location: WorkoutLocation | null) => void
  /** 심박수, 칼로리 같은 실시간 운동 수치를 반영 */
  setLiveStats: (stats: WorkoutLiveStats) => void
  /** 운동 부위를 선택하거나 해제 */
  toggleBodyPart: (part: BodyPart) => void
  /** 운동 세부 부위를 선택하거나 해제 */
  toggleBodyPartDetail: (part: BodyPart, detail: BodyPartDetail) => void
  /** 선택한 운동 부위의 세트 수를 변경 */
  updateSetCount: (
    part: BodyPart,
    setCount: number,
    detail?: BodyPartDetail,
  ) => void
  /** 운동 메모를 수정 */
  updateMemo: (memo: string) => void
  /** 운동을 일시정지 상태로 전환 */
  pauseWorkout: () => void
  /** 일시정지된 운동을 다시 시작 */
  resumeWorkout: () => void
  /** 운동을 종료하고 완료 세션을 저장한 뒤 결과를 반환 */
  completeWorkout: () => Promise<StoredWorkoutSession | null>
  /** 운동 상태와 진행 중 스냅샷을 모두 초기화 */
  resetWorkout: () => Promise<void>
}

// Provider 밖에서 잘못 사용할 경우를 잡기 위해 초기값은 null
const WorkoutContext = createContext<WorkoutContextValue | null>(null)
const ACTIVE_WORKOUT_ALLOWED_PATHS = new Set(["/workout/active", "/tempo"])

export function WorkoutProvider({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const router = useRouter()

  // 실제 운동 세션 상태 관리
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState)
  // 저장소 복구가 끝났는지 표시
  const [isHydrated, setIsHydrated] = useState(false)

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
  }, [])

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const isRecoverable =
      state.phase === "recording" || state.phase === "paused"

    if (isRecoverable && !ACTIVE_WORKOUT_ALLOWED_PATHS.has(pathname)) {
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

  // 아래 함수들은 화면이 직접 dispatch를 다루지 않게 감싼 액션 API
  const startCountdown = useCallback(() => {
    dispatch({ type: "START_COUNTDOWN" })
  }, [])

  const startRecording = useCallback(() => {
    const startedAt = new Date().toISOString()
    const sessionId = startedAt
    dispatch({
      type: "START_RECORDING",
      payload: { sessionId, startedAt },
    })
    return { sessionId, startedAt }
  }, [])

  const setLocation = useCallback((location: WorkoutLocation | null) => {
    dispatch({ type: "SET_LOCATION", payload: location })
  }, [])

  const setLiveStats = useCallback((stats: WorkoutLiveStats) => {
    dispatch({ type: "SET_LIVE_STATS", payload: stats })
  }, [])

  const toggleBodyPart = useCallback((part: BodyPart) => {
    dispatch({ type: "TOGGLE_BODY_PART", payload: part })
  }, [])

  const toggleBodyPartDetail = useCallback((part: BodyPart, detail: BodyPartDetail) => {
    dispatch({ type: "TOGGLE_BODY_PART_DETAIL", payload: { part, detail } })
  }, [])

  const updateSetCount = useCallback((
    part: BodyPart,
    setCount: number,
    detail?: BodyPartDetail,
  ) => {
    dispatch({
      type: "UPDATE_SET_COUNT",
      payload: { part, detail, setCount },
    })
  }, [])

  const updateMemo = useCallback((memo: string) => {
    dispatch({ type: "UPDATE_MEMO", payload: memo })
  }, [])

  const pauseWorkout = useCallback(() => {
    dispatch({ type: "PAUSE", payload: { pausedAt: new Date().toISOString() } })
  }, [])

  const resumeWorkout = useCallback(() => {
    dispatch({
      type: "RESUME",
      payload: { resumedAt: new Date().toISOString() },
    })
  }, [])

  const completeWorkout = useCallback(async () => {
    if (!state.sessionId || !state.startedAt) {
      return null
    }

    // 종료 시각을 reducer에 반영하고, 별도로 완료 세션 저장까지 수행한다.
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
  }, [
    state.bodyParts,
    state.location,
    state.memo,
    state.sessionId,
    state.startedAt,
  ])

  const resetWorkout = useCallback(async () => {
    dispatch({ type: "RESET" })
    await clearCurrentWorkoutSnapshot()
  }, [])

  // Context로 넘길 값을 한 객체로 묶어 하위 화면에서 재사용
  const value = useMemo<WorkoutContextValue>(
    () => ({
      state,
      isHydrated,
      startCountdown,
      startRecording,
      setLocation,
      setLiveStats,
      toggleBodyPart,
      toggleBodyPartDetail,
      updateSetCount,
      updateMemo,
      pauseWorkout,
      resumeWorkout,
      completeWorkout,
      resetWorkout,
    }),
    [
      completeWorkout,
      isHydrated,
      pauseWorkout,
      resetWorkout,
      resumeWorkout,
      setLiveStats,
      setLocation,
      startCountdown,
      startRecording,
      state,
      toggleBodyPart,
      toggleBodyPartDetail,
      updateMemo,
      updateSetCount,
    ],
  )

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  )
}

// 화면에서는 useWorkout()만 호출하면 상태와 액션을 함께 사용
export function useWorkout() {
  const context = useContext(WorkoutContext)

  if (!context) {
    throw new Error("useWorkout must be used within WorkoutProvider")
  }

  return context
}
