import type {
  BodyPart,
  BodyPartDetail,
  WorkoutBodyPartSet,
  WorkoutLocation,
} from "./types"
import type { RoutinePart } from "./weeklyRoutine"

// 운동 세션이 화면에서 어떤 단계에 있는지
export type WorkoutPhase =
  /** 아무 운동도 시작X */
  | "idle"
  /** 시작 직전 카운트 다운 */
  | "countdown"
  /** 실제 운동 기록 */
  | "recording"
  /** 일시정지 */
  | "paused"
  /** 종료됨 */
  | "completed"

// 진행 중 운동 세션 전체 상태를 한곳에 모아둔 모델
export interface WorkoutState {
  /** 운동 단계 */
  phase: WorkoutPhase
  /** 세션 아이디 */
  sessionId: string | null
  /** 시작 시각 */
  startedAt: string | null
  /** 종료 시각 */
  completedAt: string | null
  /** 유산소 시작 시각 */
  cardioStartedAt: string | null
  /** 일시정지 시각 */
  pausedAt: string | null
  /** 지금까지 pause된 총 시간 */
  pausedDuration: number
  /** 운동 부위 + 세트수 */
  bodyParts: WorkoutBodyPartSet[]
  /** 운동 메모 */
  memo: string
  /** 위도/경도 */
  location: WorkoutLocation | null
  /** 심박수 */
  heartRate: number | null
  /** 칼로리 정보 */
  activeKcal: number
  /** 칼로리 정보 */
  totalKcal: number
}

interface StartRecordingPayload {
  sessionId: string
  startedAt: string
}

// workoutReducer가 처리하는 액션 타입 목록
export type WorkoutAction =
  | { type: "START_COUNTDOWN" }
  | { type: "START_RECORDING"; payload: StartRecordingPayload }
  | { type: "SET_LOCATION"; payload: WorkoutLocation | null }
  | {
      type: "SET_LIVE_STATS"
      payload: {
        heartRate: number | null
        activeKcal: number
        totalKcal: number
      }
    }
  | { type: "TOGGLE_BODY_PART"; payload: WorkoutBodyPartSet["part"] }
  | {
      type: "UPDATE_SET_COUNT"
      payload: {
        part: WorkoutBodyPartSet["part"]
        detail?: BodyPartDetail
        setCount: number
      }
    }
  | { type: "UPDATE_MEMO"; payload: string }
  | { type: "START_CARDIO"; payload: { cardioStartedAt: string } }
  | { type: "PAUSE"; payload: { pausedAt: string } }
  | { type: "RESUME"; payload: { resumedAt: string } }
  | { type: "COMPLETE"; payload: { completedAt: string } }
  | { type: "TOGGLE_BODY_PART_DETAIL"; payload: { part: BodyPart; detail: BodyPartDetail } }
  | { type: "APPLY_BODY_PART_TEMPLATE"; payload: RoutinePart[] }
  | { type: "RESET" }
  | { type: "HYDRATE"; payload: WorkoutState }

// 새 운동을 시작하기 전 기본값
export const initialWorkoutState: WorkoutState = {
  phase: "idle",
  sessionId: null,
  startedAt: null,
  completedAt: null,
  cardioStartedAt: null,
  pausedAt: null,
  pausedDuration: 0,
  bodyParts: [],
  memo: "",
  location: null,
  heartRate: null,
  activeKcal: 0,
  totalKcal: 0,
}

export function workoutReducer(
  state: WorkoutState,
  action: WorkoutAction,
): WorkoutState {
  switch (action.type) {
    // 카운트다운 시작 액션 처리
    case "START_COUNTDOWN":
      // 새 운동 시작 버튼을 누르면 이전 진행 흔적을 지우고 카운트다운 단계로 진입
      return {
        ...initialWorkoutState,
        phase: "countdown",
      }
    // 실제 운동 기록 시작 액션 처리
    case "START_RECORDING":
      // 카운트다운이 끝나면 실제 기록 단계로 전환
      return {
        ...state,
        phase: "recording",
        sessionId: action.payload.sessionId,
        startedAt: action.payload.startedAt,
        completedAt: null,
        cardioStartedAt: null,
        pausedAt: null,
        pausedDuration: 0,
      }
    // 위치 저장 액션 처리
    case "SET_LOCATION":
      // 카운트다운 화면에서 받아온 현재 위치를 세션에 저장
      return {
        ...state,
        location: action.payload,
      }
    // 실시간 운동 수치 반영 액션 처리
    case "SET_LIVE_STATS":
      return {
        // Apple HealthKit 같은 외부 소스에서 들어온 실시간 수치를 반영
        ...state,
        heartRate: action.payload.heartRate,
        activeKcal: action.payload.activeKcal,
        totalKcal: action.payload.totalKcal,
      }
    // 운동 부위 토글 액션 처리
    case "TOGGLE_BODY_PART": {
      const exists = state.bodyParts.find(({ part }) => part === action.payload)

      // 운동 부위를 선택하거나, 이미 선택된 부위면 다시 눌러서 해제
      return {
        ...state,
        bodyParts: exists
          // 이미 선택한 부위면 선택 해제
          ? state.bodyParts.filter(({ part }) => part !== action.payload)
          // 새로 선택한 부위면 기본 세트 수 10으로 추가
          : [...state.bodyParts, { part: action.payload, setCount: 10 }],
      }
    }
    // 세트 수 변경 액션 처리
    case "UPDATE_SET_COUNT":
      // 선택한 운동 부위의 세트 수를 바꾸되 최소 1세트는 유지
      return {
        ...state,
        bodyParts: state.bodyParts.map((item) =>
          item.part === action.payload.part &&
          item.detail === action.payload.detail
            ? { ...item, setCount: Math.max(1, action.payload.setCount) }
            : item,
        ),
      }
    // 메모 변경 액션 처리
    case "UPDATE_MEMO":
      // 사용자가 입력한 운동 메모를 그대로 반영
      return {
        ...state,
        memo: action.payload,
      }
    case "START_CARDIO":
      if (state.phase !== "recording" || state.cardioStartedAt) {
        return state
      }

      return {
        ...state,
        cardioStartedAt: action.payload.cardioStartedAt,
      }
    // 일시정지 액션 처리
    case "PAUSE":
      // 일시정지 시각을 저장하고 phase를 paused로 전환
      return {
        ...state,
        phase: "paused",
        pausedAt: action.payload.pausedAt,
      }
    // 운동 재개 액션 처리
    case "RESUME": {
      if (!state.pausedAt) {
        return state
      }

      // 이번 pause 구간 길이를 누적해서 실제 운동 시간 계산에 사용
      const pausedMs =
        new Date(action.payload.resumedAt).getTime() -
        new Date(state.pausedAt).getTime()

      // pause된 시간을 누적하고 다시 recording 단계로 복귀
      return {
        ...state,
        phase: "recording",
        pausedAt: null,
        pausedDuration: state.pausedDuration + Math.max(pausedMs, 0),
      }
    }
    // 운동 종료 액션 처리
    case "COMPLETE":
      // 종료 시점만 기록하고, 세션 저장은 상위 context에서 처리
      return {
        ...state,
        phase: "completed",
        completedAt: action.payload.completedAt,
        pausedAt: null,
      }
    case "TOGGLE_BODY_PART_DETAIL": {
      const { part, detail } = action.payload
      const exists = state.bodyParts.some(
        (bp) => bp.part === part && bp.detail === detail,
      )

      if (exists) {
        return {
          ...state,
          bodyParts: state.bodyParts.filter(
            (bp) => !(bp.part === part && bp.detail === detail),
          ),
        }
      }

      return {
        ...state,
        bodyParts: [...state.bodyParts, { part, detail, setCount: 10 }],
      }
    }
    // 루틴 템플릿 적용 액션 처리
    case "APPLY_BODY_PART_TEMPLATE":
      // 추천된 루틴 세션의 부위로 기존 선택을 대체
      return {
        ...state,
        bodyParts: action.payload.map((item) => ({
          part: item.part,
          details: item.details,
          setCount: 10,
        })),
      }
    // 저장 상태 복구 액션 처리
    case "HYDRATE":
      // 저장해둔 진행 중 운동 스냅샷으로 상태를 통째로 복구
      return {
        ...initialWorkoutState,
        ...action.payload,
        cardioStartedAt: action.payload.cardioStartedAt ?? null,
      }
    // 초기화 액션 처리
    case "RESET":
      // 운동 세션을 초기 상태로 완전히 되돌림
      return initialWorkoutState
    default:
      return state
  }
}
