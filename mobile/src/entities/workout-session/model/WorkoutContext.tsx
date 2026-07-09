import { useDebouncedEffect } from "@/shared/hooks/useDebouncedEffect"
import { AppState } from "react-native"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type PropsWithChildren,
} from "react"
import {
  clearCurrentWorkoutSnapshot,
  loadCurrentWorkoutSnapshot,
  saveCompletedWorkoutSession,
  saveCurrentWorkoutSnapshot,
  updateStoredWorkoutHealthKitMetrics,
} from "./sessionStorage"
import { upsertWorkoutPlaceReminderPlaceFromSession } from "./workoutPlaceReminderStorage"
import { syncWorkoutPlaceArrivalReminder } from "../lib/workoutPlaceArrivalReminder"
import {
  consumeWorkoutLiveActivityCommands,
  endWorkoutLiveActivity,
  startWorkoutLiveActivity,
} from "../api/liveActivity"
import { endWorkoutSession } from "../api/healthKit"
import { processCompletedWorkoutCalendarAutoAdd } from "../lib/calendar"
import { syncWorkoutReminderAtNight } from "../lib/reminder"
import { getWorkoutLiveActivityTiming } from "../lib/liveActivityTiming"
import { loadRoutineCycleProgressSnapshot } from "../lib/routineCycleProgressSnapshot"
import {
  buildCompletedWorkoutSession,
  getWorkoutCompletedAt,
} from "../lib/workoutCompletion"
import type {
  BodyPart,
  BodyPartDetail,
  StoredWorkoutSession,
  WorkoutBodyPartSet,
  WorkoutLiveStats,
  WorkoutLocation,
  WorkoutRoutineSubstitution,
} from "./types"
import type { RoutinePart } from "./routineCycle"
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
  /** 현재 시각부터 운동 종료까지 유산소로 기록 */
  startCardio: () => void
  /** 운동을 일시정지 상태로 전환 */
  pauseWorkout: () => void
  /** 일시정지된 운동을 다시 시작 */
  resumeWorkout: () => void
  /** 운동을 종료하고 완료 세션을 저장한 뒤 결과를 반환 */
  completeWorkout: (options?: {
    routineSubstitution?: WorkoutRoutineSubstitution | null
    isDeload?: boolean
  }) => Promise<StoredWorkoutSession | null>
  /** 운동 상태와 진행 중 스냅샷을 모두 초기화 */
  resetWorkout: () => Promise<void>
  /** 추천된 루틴 부위 목록으로 운동 부위를 일괄 교체 */
  applyBodyPartTemplate: (parts: RoutinePart[]) => void
  /** 이전 기록에서 계산한 운동 부위 + 세트수 목록을 적용 */
  applyBodyPartSets: (bodyParts: WorkoutBodyPartSet[]) => void
}

// Provider 밖에서 잘못 사용할 경우를 잡기 위해 초기값은 null
const WorkoutContext = createContext<WorkoutContextValue | null>(null)

/** Live Activity 운동 상태 문구 */
function getWorkoutLiveActivityStatusText(params: {
  cardioStartedAt: string | null
  phase: WorkoutState["phase"]
}) {
  if (params.phase === "paused") {
    return params.cardioStartedAt ? "유산소 일시정지" : "운동 일시정지"
  }

  return params.cardioStartedAt ? "유산소 기록 중" : "운동 기록 중"
}

export function WorkoutProvider({ children }: PropsWithChildren) {
  // 실제 운동 세션 상태 관리
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState)
  // 저장소 복구가 끝났는지 표시
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

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    if (
      (state.phase === "recording" || state.phase === "paused") &&
      state.sessionId
    ) {
      const timing = getWorkoutLiveActivityTiming({
        pausedAt: state.pausedAt,
        pausedDuration: state.pausedDuration,
        phase: state.phase,
        startedAt: state.startedAt,
      })

      if (!timing) {
        return
      }

      void startWorkoutLiveActivity({
        cardioStartedAt: state.cardioStartedAt,
        sessionId: state.sessionId,
        statusText: getWorkoutLiveActivityStatusText({
          cardioStartedAt: state.cardioStartedAt,
          phase: state.phase,
        }),
        timerPausedAt: timing.timerPausedAt,
        timerStartAt: timing.timerStartAt,
      })
      return
    }

    void endWorkoutLiveActivity()
  }, [
    isHydrated,
    state.cardioStartedAt,
    state.pausedAt,
    state.pausedDuration,
    state.phase,
    state.sessionId,
    state.startedAt,
  ])

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

  const startCardio = useCallback(() => {
    dispatch({
      type: "START_CARDIO",
      payload: { cardioStartedAt: new Date().toISOString() },
    })
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

  const completeWorkout = useCallback(async (options: {
    routineSubstitution?: WorkoutRoutineSubstitution | null
    isDeload?: boolean
  } = {}) => {
    if (!state.sessionId || !state.startedAt) {
      return null
    }

    // 종료 시각을 reducer에 반영하고, 별도로 완료 세션 저장까지 수행한다.
    const completedAt = getWorkoutCompletedAt({ pausedAt: state.pausedAt })
    dispatch({ type: "COMPLETE", payload: { completedAt } })
    const isDeload =
      options.isDeload ??
      (await loadRoutineCycleProgressSnapshot()
        .then((snapshot) => snapshot.isDeloadCycle)
        .catch(() => false))

    const session = buildCompletedWorkoutSession(
      {
        activeKcal: state.activeKcal,
        bodyParts: state.bodyParts,
        cardioStartedAt: state.cardioStartedAt,
        location: state.location,
        memo: state.memo,
        sessionId: state.sessionId,
        startedAt: state.startedAt,
        totalKcal: state.totalKcal,
      },
      completedAt,
      options.routineSubstitution ?? null,
      isDeload,
    )
    if (!session) {
      return null
    }

    await saveCompletedWorkoutSession(session)
    await upsertWorkoutPlaceReminderPlaceFromSession(session).catch(
      () => undefined,
    )
    await syncWorkoutPlaceArrivalReminder({ allowPrompt: false }).catch(
      () => undefined,
    )
    await clearCurrentWorkoutSnapshot()
    return session
  }, [
    state.bodyParts,
    state.activeKcal,
    state.cardioStartedAt,
    state.location,
    state.memo,
    state.pausedAt,
    state.sessionId,
    state.startedAt,
    state.totalKcal,
  ])

  const completeLiveActivityWorkout = useCallback(async () => {
    if (!state.sessionId || !state.startedAt) {
      return
    }

    const completedSession = await completeWorkout()
    if (!completedSession) {
      return
    }

    const endedWorkout = await endWorkoutSession({
      startedAt: completedSession.startedAt,
      endedAt: completedSession.completedAt,
      activeKcal: state.activeKcal,
      totalKcal: state.totalKcal,
    }).catch(() => false)

    if (endedWorkout && typeof endedWorkout !== "boolean") {
      await updateStoredWorkoutHealthKitMetrics(completedSession.sessionId, {
        averageHeartRate: endedWorkout.averageHeartRate,
        healthKitWorkoutUUID: endedWorkout.healthKitWorkoutUUID,
      }).catch(() => undefined)
    }

    await syncWorkoutReminderAtNight({ allowPrompt: false }).catch(
      () => false,
    )
    await processCompletedWorkoutCalendarAutoAdd(
      completedSession,
      "background",
    ).catch(() => false)
    await endWorkoutLiveActivity().catch(() => false)
  }, [
    completeWorkout,
    state.activeKcal,
    state.sessionId,
    state.startedAt,
    state.totalKcal,
  ])

  const consumeLiveActivityCommands = useCallback(async () => {
    if (
      !isHydrated ||
      !state.sessionId ||
      (state.phase !== "recording" && state.phase !== "paused")
    ) {
      return
    }

    const commands = await consumeWorkoutLiveActivityCommands()
    for (const command of commands) {
      if (command.sessionId !== state.sessionId) {
        continue
      }

      if (command.command === "pause") {
        dispatch({ type: "PAUSE", payload: { pausedAt: command.createdAt } })
      } else if (command.command === "resume") {
        dispatch({ type: "RESUME", payload: { resumedAt: command.createdAt } })
      } else if (command.command === "startCardio") {
        if (!state.cardioStartedAt && state.phase === "recording") {
          dispatch({
            type: "START_CARDIO",
            payload: { cardioStartedAt: command.createdAt },
          })
        }
      } else {
        await completeLiveActivityWorkout()
      }
    }
  }, [
    completeLiveActivityWorkout,
    isHydrated,
    state.cardioStartedAt,
    state.phase,
    state.sessionId,
  ])

  useEffect(() => {
    void consumeLiveActivityCommands()

    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        void consumeLiveActivityCommands()
      }
    })

    return () => subscription.remove()
  }, [consumeLiveActivityCommands])

  useEffect(() => {
    if (
      !isHydrated ||
      !state.sessionId ||
      (state.phase !== "recording" && state.phase !== "paused")
    ) {
      return
    }

    const timer = setInterval(() => {
      void consumeLiveActivityCommands()
    }, 1000)

    return () => clearInterval(timer)
  }, [
    consumeLiveActivityCommands,
    isHydrated,
    state.phase,
    state.sessionId,
  ])

  const resetWorkout = useCallback(async () => {
    dispatch({ type: "RESET" })
    await clearCurrentWorkoutSnapshot()
  }, [])

  const applyBodyPartTemplate = useCallback((parts: RoutinePart[]) => {
    dispatch({ type: "APPLY_BODY_PART_TEMPLATE", payload: parts })
  }, [])

  const applyBodyPartSets = useCallback((bodyParts: WorkoutBodyPartSet[]) => {
    dispatch({ type: "APPLY_BODY_PART_SETS", payload: bodyParts })
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
      startCardio,
      pauseWorkout,
      resumeWorkout,
      completeWorkout,
      resetWorkout,
      applyBodyPartTemplate,
      applyBodyPartSets,
    }),
    [
      applyBodyPartSets,
      applyBodyPartTemplate,
      completeWorkout,
      isHydrated,
      pauseWorkout,
      resetWorkout,
      resumeWorkout,
      setLiveStats,
      setLocation,
      startCardio,
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
