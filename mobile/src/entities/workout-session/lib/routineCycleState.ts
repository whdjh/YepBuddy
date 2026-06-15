import type {
  RoutineCycleSession,
  RoutineCyclePromptState,
  RoutineCycleSettings,
} from "../model/routineCycle"

export type RoutineCycleSetupPromptKind = "cycleComplete"

// 루틴 사이클의 현재 표시 상태
export type RoutineCyclePhase = "regular" | "deload" | "complete"

// 루틴 사이클 계산 결과
// 날짜 기반 fallback과 슬롯 기반 진행 계산의 공용 타입
export interface RoutineCycleState {
  // 화면 current/total의 current 값. 슬롯 기반에서는 완료 사이클 수 + 1
  currentCycleNumber: number
  // 화면 current/total의 total 값. 훈련 사이클 + 디로드 사이클 전체 개수
  totalCycleCount: number
  // 현재 표시 회차의 디로드 구간 여부
  isDeloadCycle: boolean
  // 설정된 전체 사이클의 완료 여부
  isCycleComplete: boolean
}

// 슬롯 기반 루틴 사이클 진행 상태
// 실제 운동 부위가 아닌 저장 완료 루틴 슬롯 기준의 채움 상태
export interface RoutineCycleProgressState {
  // 기존 설정/마이그레이션 호환용 시작 날짜 키
  cycleStartDateKey: string
  // 현재까지 완전히 채운 루틴 사이클 수
  completedCycleCount: number
  // 현재 사이클 안에서 이미 채워진 루틴 슬롯 ID 목록
  filledSlotIds: string[]
}

// 진행 중 루틴 설정 화면에서 적용할 편집 제한 정책
export interface RoutineCycleEditPolicy {
  // 루틴 슬롯 저장 또는 사이클 완료 이력이 있어 진행이 시작되었는지 여부
  hasRoutineStarted: boolean
  // 루틴 슬롯 구성처럼 진행 중 변경 시 사이클 정합성이 깨질 수 있는 구조 편집 가능 여부
  canEditRoutineStructure: boolean
  // 진행 중인 표시 회차보다 훈련 회차 입력값을 낮추지 않기 위한 하한값
  minimumTrainingCycles: number
}

// 루틴 사이클 완료 안내 노출 여부 판단에 필요한 입력값
interface RoutineCycleSetupPromptInput {
  // 현재 루틴 사이클 설정. 없으면 안내를 노출하지 않음
  settings: RoutineCycleSettings | null
  // 사용자가 현재 사이클 앵커 날짜의 안내를 닫았는지 추적하는 상태
  promptState: RoutineCyclePromptState
  // 안내 중복 노출 방지에 쓰는 현재 사이클 앵커 날짜 키
  currentCycleAnchorDateKey: string
  // 이미 계산한 슬롯 기반 사이클 상태
  cycleState: RoutineCycleState | null
}

function getTotalCycleCount(settings: RoutineCycleSettings) {
  return Math.max(1, settings.trainingCycles) + Math.max(0, settings.deloadCycles)
}

// 설정된 루틴 슬롯 ID 집합
function getRoutineSlotIds(routineSessions: RoutineCycleSession[]) {
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
export function createRoutineCycleProgressState(
  cycleStartDateKey: string,
): RoutineCycleProgressState {
  return {
    cycleStartDateKey,
    completedCycleCount: 0,
    filledSlotIds: [],
  }
}

// 저장된 슬롯 진행 상태를 안전한 형태로 정규화
export function normalizeRoutineCycleProgressState(
  progress: Partial<RoutineCycleProgressState> | null | undefined,
  fallbackCycleStartDateKey: string,
): RoutineCycleProgressState {
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

// 슬롯 기반 루틴 사이클 표시 상태 계산
// 달력 경계와 무관한 완료 사이클 수 기반 current 계산
export function getRoutineCycleStateFromProgress(
  settings: RoutineCycleSettings,
  progress: RoutineCycleProgressState,
): RoutineCycleState {
  const trainingCycles = Math.max(1, settings.trainingCycles)
  const deloadCycles = Math.max(0, settings.deloadCycles)
  const totalCycleCount = getTotalCycleCount(settings)
  const completedCycleCount = normalizeCompletedCycleCount(
    progress.completedCycleCount,
  )
  const isCycleComplete = completedCycleCount >= totalCycleCount
  const currentCycleNumber = isCycleComplete
    ? totalCycleCount
    : completedCycleCount + 1

  return {
    currentCycleNumber,
    totalCycleCount,
    isDeloadCycle:
      !isCycleComplete &&
      deloadCycles > 0 &&
      currentCycleNumber > trainingCycles,
    isCycleComplete,
  }
}

// 진행 중 루틴 설정 화면에서 구조 편집 가능 여부와 훈련 사이클 하한을 계산
export function getRoutineCycleEditPolicy(
  settings: RoutineCycleSettings,
  progress: RoutineCycleProgressState,
): RoutineCycleEditPolicy {
  const normalizedProgress = normalizeRoutineCycleProgressState(
    progress,
    settings.cycleStartDateKey,
  )
  const hasRoutineStarted =
    normalizedProgress.completedCycleCount > 0 ||
    normalizedProgress.filledSlotIds.length > 0
  const cycleState = getRoutineCycleStateFromProgress(
    settings,
    normalizedProgress,
  )

  return {
    hasRoutineStarted,
    canEditRoutineStructure: !hasRoutineStarted,
    minimumTrainingCycles: hasRoutineStarted
      ? Math.max(1, cycleState.currentCycleNumber)
      : 1,
  }
}

// 선택 루틴 슬롯의 현재 사이클 채움 처리
// 실제 bodyParts와 슬롯 구성 간 일치 여부 무시
// 전체 슬롯 채움 완료 시 다음 사이클 이동 및 filledSlotIds 초기화
export function fillRoutineCycleSlotProgress(
  settings: RoutineCycleSettings,
  progress: RoutineCycleProgressState,
  slotId: string,
): RoutineCycleProgressState {
  const normalizedProgress = normalizeRoutineCycleProgressState(
    progress,
    settings.cycleStartDateKey,
  )
  const cycleState = getRoutineCycleStateFromProgress(
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
      cycleState.totalCycleCount,
      normalizedProgress.completedCycleCount + 1,
    ),
    filledSlotIds: [],
  }
}

// 현재 사이클 앵커 날짜를 새 사이클 시작 기준으로 기록
export function restartRoutineCycle(
  settings: RoutineCycleSettings,
  cycleStartDateKey: string,
): RoutineCycleSettings {
  return {
    ...settings,
    cycleStartDateKey,
  }
}

// 사이클 상태를 화면에서 쓰기 쉬운 phase 값으로 변환
export function getRoutineCyclePhase(
  cycleState: RoutineCycleState,
): RoutineCyclePhase {
  if (cycleState.isCycleComplete) {
    return "complete"
  }

  return cycleState.isDeloadCycle ? "deload" : "regular"
}

// 설정된 루틴 사이클이 끝났을 때 안내 모달을 보여줄지 판단
export function shouldShowRoutineCycleSetupPrompt({
  settings,
  promptState,
  currentCycleAnchorDateKey,
  cycleState,
}: RoutineCycleSetupPromptInput): RoutineCycleSetupPromptKind | null {
  if (!settings || !cycleState) {
    return null
  }

  if (!cycleState.isCycleComplete) {
    return null
  }

  return promptState.cycleRenewalDismissedForAnchorDateKey ===
    currentCycleAnchorDateKey
    ? null
    : "cycleComplete"
}
