import AsyncStorage from "@react-native-async-storage/async-storage"
import { getThisWeekDateRange } from "@/shared/lib/date"
import { parseJsonOrNull } from "@/shared/lib/json"
import {
  createRoutineCycleProgressState,
  fillRoutineCycleSlotProgress,
  normalizeRoutineCycleProgressState,
  type RoutineCycleProgressState,
} from "../lib/routineCycleState"
import {
  createDefaultRoutineCycleSettings,
  DEFAULT_ROUTINE_CYCLE_PROMPT_STATE,
  normalizeRoutineCycleSettings,
  resolveRoutineCycleFeatureStatus,
  type RoutineCycleFeatureStatus,
  type RoutineCyclePromptState,
  type RoutineCycleSettings,
} from "./routineCycle"

const KEY = "yb:workout:weekly-routine"
const FEATURE_STATUS_KEY = "yb:workout:weekly-routine-feature-status"
const PROMPT_KEY = "yb:workout:weekly-routine-prompt"
const CYCLE_PROGRESS_KEY = "yb:workout:weekly-routine-cycle-progress"

// 루틴 사이클 설정을 AsyncStorage에 저장
export async function saveRoutineCycleSettings(
  settings: RoutineCycleSettings,
): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings))
}

// 저장된 루틴 사이클 설정을 불러옴. 없으면 null 반환
export async function loadRoutineCycleSettings(): Promise<RoutineCycleSettings | null> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? parseJsonOrNull<RoutineCycleSettings>(raw) : null
}

// 슬롯 기반 루틴 사이클 진행 상태를 AsyncStorage에 저장
export async function saveRoutineCycleProgressState(
  progress: RoutineCycleProgressState,
): Promise<void> {
  await AsyncStorage.setItem(CYCLE_PROGRESS_KEY, JSON.stringify(progress))
}

// 저장된 슬롯 기반 루틴 사이클 진행 상태를 불러오고 없거나 깨지면 기본값을 반환
export async function loadRoutineCycleProgressState(
  fallbackCycleStartDateKey: string,
): Promise<RoutineCycleProgressState> {
  const raw = await AsyncStorage.getItem(CYCLE_PROGRESS_KEY)
  const parsed = raw
    ? parseJsonOrNull<Partial<RoutineCycleProgressState>>(raw)
    : null

  return normalizeRoutineCycleProgressState(parsed, fallbackCycleStartDateKey)
}

// 현재 루틴 사이클 진행 상태를 초기화
export async function resetRoutineCycleProgressState(
  cycleStartDateKey: string,
): Promise<RoutineCycleProgressState> {
  const progress = createRoutineCycleProgressState(cycleStartDateKey)
  await saveRoutineCycleProgressState(progress)
  return progress
}

// 저장 완료된 운동이 선택한 루틴 슬롯을 채웠음을 기록
export async function markRoutineCycleSlotFilled(
  slotId: string,
): Promise<RoutineCycleProgressState | null> {
  const { startDateKey } = getThisWeekDateRange()
  const [settings, featureStatus] = await Promise.all([
    loadRoutineCycleSettings(),
    loadRoutineCycleFeatureStatus(),
  ])

  if (featureStatus !== "enabled") {
    return null
  }

  const normalizedSettings = normalizeRoutineCycleSettings(
    settings ?? createDefaultRoutineCycleSettings(startDateKey),
    startDateKey,
  )
  const currentProgress = await loadRoutineCycleProgressState(
    normalizedSettings.cycleStartDateKey,
  )
  const nextProgress = fillRoutineCycleSlotProgress(
    normalizedSettings,
    currentProgress,
    slotId,
  )

  await saveRoutineCycleProgressState(nextProgress)
  return nextProgress
}

// 저장소 값이 깨졌거나 예전 형식이면 마이그레이션 로직에서 보정하도록 null 반환
function parseRoutineCycleFeatureStatus(
  raw: string | null,
): RoutineCycleFeatureStatus | null {
  if (raw === "unasked" || raw === "enabled" || raw === "disabled") {
    return raw
  }

  return null
}

// 최초 안내 모달에서 사용자가 루틴 사용 여부를 선택한 결과를 저장
export async function saveRoutineCycleFeatureStatus(
  status: RoutineCycleFeatureStatus,
): Promise<void> {
  await AsyncStorage.setItem(FEATURE_STATUS_KEY, status)
}

// 저장된 선택 상태를 불러오고, 기존 루틴 설정만 있는 사용자 상태를 보정
export async function loadRoutineCycleFeatureStatus(): Promise<RoutineCycleFeatureStatus> {
  const [rawStatus, settings] = await Promise.all([
    AsyncStorage.getItem(FEATURE_STATUS_KEY),
    loadRoutineCycleSettings(),
  ])

  return resolveRoutineCycleFeatureStatus(
    parseRoutineCycleFeatureStatus(rawStatus),
    settings !== null,
  )
}

// 루틴 안내 모달 노출 상태를 불러옴. 이전 저장값에는 기본값을 보강
export async function loadRoutineCyclePromptState(): Promise<RoutineCyclePromptState> {
  const raw = await AsyncStorage.getItem(PROMPT_KEY)
  if (!raw) {
    return DEFAULT_ROUTINE_CYCLE_PROMPT_STATE
  }

  const parsed = parseJsonOrNull<
    Partial<RoutineCyclePromptState> & {
      cycleRenewalDismissedForWeekStartDateKey?: string | null
    }
  >(raw)
  if (!parsed) {
    return DEFAULT_ROUTINE_CYCLE_PROMPT_STATE
  }

  return {
    cycleRenewalDismissedForAnchorDateKey:
      parsed.cycleRenewalDismissedForAnchorDateKey ??
      parsed.cycleRenewalDismissedForWeekStartDateKey ??
      null,
  }
}

// 루틴 안내 모달 노출 상태를 AsyncStorage에 저장
export async function saveRoutineCyclePromptState(
  state: RoutineCyclePromptState,
): Promise<void> {
  await AsyncStorage.setItem(PROMPT_KEY, JSON.stringify(state))
}

// 사이클 종료 안내 모달을 해당 앵커 날짜에 다시 보이지 않게 기록
export async function dismissRoutineCycleRenewalPrompt(
  cycleAnchorDateKey: string,
): Promise<void> {
  const current = await loadRoutineCyclePromptState()
  await saveRoutineCyclePromptState({
    ...current,
    cycleRenewalDismissedForAnchorDateKey: cycleAnchorDateKey,
  })
}
