import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react"
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
import { useWorkoutActions } from "./useWorkoutActions"
import { useWorkoutCompletion } from "./useWorkoutCompletion"
import { useWorkoutLiveActivity } from "./useWorkoutLiveActivity"
import { useWorkoutPersistence } from "./useWorkoutPersistence"

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

/** 현재 운동 상태와 세션 제어 액션을 앱 전체에 제공 */
export function WorkoutProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState)
  const isHydrated = useWorkoutPersistence({ dispatch, state })
  const { completeLiveActivityWorkout, completeWorkout } =
    useWorkoutCompletion({ dispatch, state })

  useWorkoutLiveActivity({
    completeLiveActivityWorkout,
    dispatch,
    isHydrated,
    state,
  })

  const actions = useWorkoutActions(dispatch)

  const value = useMemo<WorkoutContextValue>(
    () => ({
      state,
      isHydrated,
      completeWorkout,
      ...actions,
    }),
    [actions, completeWorkout, isHydrated, state],
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
