import type {
  WeeklyRoutineSession,
  WeeklyRoutinePromptState,
  WeeklyRoutineSettings,
} from "../model/weeklyRoutine"
import { getElapsedWeeksBetweenDateKeys } from "@/shared/lib/date"

export type WeeklyRoutineSetupPromptKind = "cycleComplete"

// 루틴 사이클의 현재 표시 상태
export type WeeklyRoutineCyclePhase = "regular" | "deload" | "complete"

// 루틴 사이클 계산 결과
// 기존 week 기반 이름과 슬롯 기반 현재 회차 표시값의 공용 타입
export interface WeeklyRoutineCycleState {
  // 화면 current/total의 current 값. 슬롯 기반에서는 완료 사이클 수 + 1
  currentWeekNumber: number
  // 화면 current/total의 total 값. 훈련 사이클 + 디로드 사이클 전체 개수
  totalCycleWeeks: number
  // 현재 표시 회차의 디로드 구간 여부
  isDeloadWeek: boolean
  // 설정된 전체 사이클의 완료 여부
  isCycleComplete: boolean
}

// 슬롯 기반 루틴 사이클 진행 상태
// 실제 운동 부위가 아닌 저장 완료 루틴 슬롯 기준의 채움 상태
export interface WeeklyRoutineCycleProgress {
  // 기존 설정/마이그레이션 호환용 시작 날짜 키
  cycleStartDateKey: string
  // 현재까지 완전히 채운 루틴 사이클 수
  completedCycleCount: number
  // 현재 사이클 안에서 이미 채워진 루틴 슬롯 ID 목록
  filledSlotIds: string[]
}

interface WeeklyRoutineSetupPromptInput {
  settings: WeeklyRoutineSettings | null
  promptState: WeeklyRoutinePromptState
  currentWeekStartDateKey: string
  cycleState?: WeeklyRoutineCycleState | null
}

function getTotalCycleWeeks(settings: WeeklyRoutineSettings) {
  return Math.max(1, settings.trainingWeeks) + Math.max(0, settings.deloadWeeks)
}

// 설정된 루틴 슬롯 ID 집합
function getRoutineSlotIds(routineSessions: WeeklyRoutineSession[]) {
  return new Set(routineSessions.map((session) => session.id))
}

// 저장소 오염 값 방지용 완료 회차 정규화
function normalizeCompletedCycleCount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0
}

// 저장소 슬롯 ID 목록의 문자열 필터링 및 중복 제거
function normalizeFilledSlotIds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.filter((id): id is string => typeof id === "string"))]
}

// 새 슬롯 기반 루틴 사이클 진행 상태 생성
export function createWeeklyRoutineCycleProgress(
  cycleStartDateKey: string,
): WeeklyRoutineCycleProgress {
  return {
    cycleStartDateKey,
    completedCycleCount: 0,
    filledSlotIds: [],
  }
}

// 저장된 슬롯 진행 상태를 안전한 형태로 정규화
export function normalizeWeeklyRoutineCycleProgress(
  progress: Partial<WeeklyRoutineCycleProgress> | null | undefined,
  fallbackCycleStartDateKey: string,
): WeeklyRoutineCycleProgress {
  return {
    cycleStartDateKey:
      typeof progress?.cycleStartDateKey === "string" &&
      progress.cycleStartDateKey.length > 0
        ? progress.cycleStartDateKey
        : fallbackCycleStartDateKey,
    completedCycleCount: normalizeCompletedCycleCount(
      progress?.completedCycleCount,
    ),
    filledSlotIds: normalizeFilledSlotIds(progress?.filledSlotIds),
  }
}

// 날짜 기반 루틴 사이클 상태 계산
// 슬롯 기반 전환 전 계산 방식 및 cycleState 미제공 시 fallback
export function getWeeklyRoutineCycleState(
  settings: WeeklyRoutineSettings,
  currentWeekStartDateKey: string,
): WeeklyRoutineCycleState {
  const trainingWeeks = Math.max(1, settings.trainingWeeks)
  const deloadWeeks = Math.max(0, settings.deloadWeeks)
  const totalCycleWeeks = trainingWeeks + deloadWeeks
  const elapsedWeeks = getElapsedWeeksBetweenDateKeys(
    settings.cycleStartDateKey,
    currentWeekStartDateKey,
  )
  const currentWeekNumber = elapsedWeeks + 1
  const isCycleComplete = elapsedWeeks >= totalCycleWeeks

  return {
    currentWeekNumber,
    totalCycleWeeks,
    isDeloadWeek:
      !isCycleComplete &&
      deloadWeeks > 0 &&
      currentWeekNumber > trainingWeeks,
    isCycleComplete,
  }
}

// 슬롯 기반 루틴 사이클 표시 상태 계산
// 달력 경계와 무관한 완료 사이클 수 기반 current 계산
export function getWeeklyRoutineCycleStateFromProgress(
  settings: WeeklyRoutineSettings,
  progress: WeeklyRoutineCycleProgress,
): WeeklyRoutineCycleState {
  const trainingWeeks = Math.max(1, settings.trainingWeeks)
  const deloadWeeks = Math.max(0, settings.deloadWeeks)
  const totalCycleWeeks = getTotalCycleWeeks(settings)
  const completedCycleCount = normalizeCompletedCycleCount(
    progress.completedCycleCount,
  )
  const isCycleComplete = completedCycleCount >= totalCycleWeeks
  const currentWeekNumber = isCycleComplete
    ? totalCycleWeeks
    : completedCycleCount + 1

  return {
    currentWeekNumber,
    totalCycleWeeks,
    isDeloadWeek:
      !isCycleComplete &&
      deloadWeeks > 0 &&
      currentWeekNumber > trainingWeeks,
    isCycleComplete,
  }
}

// 선택 루틴 슬롯의 현재 사이클 채움 처리
// 실제 bodyParts와 슬롯 구성 간 일치 여부 무시
// 전체 슬롯 채움 완료 시 다음 사이클 이동 및 filledSlotIds 초기화
export function fillWeeklyRoutineSlotProgress(
  settings: WeeklyRoutineSettings,
  progress: WeeklyRoutineCycleProgress,
  slotId: string,
): WeeklyRoutineCycleProgress {
  const normalizedProgress = normalizeWeeklyRoutineCycleProgress(
    progress,
    settings.cycleStartDateKey,
  )
  const cycleState = getWeeklyRoutineCycleStateFromProgress(
    settings,
    normalizedProgress,
  )

  if (cycleState.isCycleComplete) {
    return normalizedProgress
  }

  const slotIds = getRoutineSlotIds(settings.sessions)
  // 설정에서 제거된 슬롯 ID 무시
  if (!slotIds.has(slotId)) {
    return normalizedProgress
  }

  // 현재 설정에 없는 저장 슬롯 ID 제거
  const filledSlotIds = [
    ...new Set([...normalizedProgress.filledSlotIds, slotId]),
  ].filter((id) => slotIds.has(id))

  if (filledSlotIds.length < slotIds.size) {
    return {
      ...normalizedProgress,
      filledSlotIds,
    }
  }

  // 모든 슬롯 채움 완료에 따른 회차 증가 및 다음 사이클 초기화
  return {
    ...normalizedProgress,
    completedCycleCount: Math.min(
      cycleState.totalCycleWeeks,
      normalizedProgress.completedCycleCount + 1,
    ),
    filledSlotIds: [],
  }
}

// 현재 주를 새 사이클 시작 주차로 기록
export function restartWeeklyRoutineCycle(
  settings: WeeklyRoutineSettings,
  cycleStartDateKey: string,
): WeeklyRoutineSettings {
  return {
    ...settings,
    cycleStartDateKey,
  }
}

// 사이클 상태를 화면에서 쓰기 쉬운 phase 값으로 변환
export function getWeeklyRoutineCyclePhase(
  cycleState: WeeklyRoutineCycleState,
): WeeklyRoutineCyclePhase {
  if (cycleState.isCycleComplete) {
    return "complete"
  }

  return cycleState.isDeloadWeek ? "deload" : "regular"
}

// 설정된 루틴 사이클이 끝났을 때 안내 모달을 보여줄지 판단
export function shouldShowWeeklyRoutineSetupPrompt({
  settings,
  promptState,
  currentWeekStartDateKey,
  cycleState: providedCycleState,
}: WeeklyRoutineSetupPromptInput): WeeklyRoutineSetupPromptKind | null {
  if (!settings) {
    return null
  }

  // 슬롯 기반 cycleState 우선, 미제공 시 날짜 기반 fallback
  const cycleState =
    providedCycleState ??
    getWeeklyRoutineCycleState(settings, currentWeekStartDateKey)

  if (!cycleState.isCycleComplete) {
    return null
  }

  return promptState.cycleRenewalDismissedForWeekStartDateKey ===
    currentWeekStartDateKey
    ? null
    : "cycleComplete"
}
