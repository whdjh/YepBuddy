import AsyncStorage from "@react-native-async-storage/async-storage"
import { getThisWeekDateRange } from "@/shared/lib/date"
import { parseJsonOrNull } from "@/shared/lib/json"
import {
  createWeeklyRoutineCycleProgress,
  fillWeeklyRoutineSlotProgress,
  normalizeWeeklyRoutineCycleProgress,
  type WeeklyRoutineCycleProgress,
} from "../lib/weeklyRoutineCycle"
import {
  createDefaultWeeklyRoutineSettings,
  DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE,
  normalizeWeeklyRoutineSettings,
  resolveWeeklyRoutineFeatureStatus,
  type WeeklyRoutineFeatureStatus,
  type WeeklyRoutinePromptState,
  type WeeklyRoutineSettings,
} from "./weeklyRoutine"

const KEY = "yb:workout:weekly-routine"
const FEATURE_STATUS_KEY = "yb:workout:weekly-routine-feature-status"
const PROMPT_KEY = "yb:workout:weekly-routine-prompt"
const CYCLE_PROGRESS_KEY = "yb:workout:weekly-routine-cycle-progress"

// 주간 루틴 설정을 AsyncStorage에 저장
export async function saveWeeklyRoutineSettings(
  settings: WeeklyRoutineSettings,
): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings))
}

// 저장된 주간 루틴 설정을 불러옴. 없으면 null 반환
export async function loadWeeklyRoutineSettings(): Promise<WeeklyRoutineSettings | null> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? parseJsonOrNull<WeeklyRoutineSettings>(raw) : null
}

// 슬롯 기반 루틴 사이클 진행 상태를 AsyncStorage에 저장
export async function saveWeeklyRoutineCycleProgress(
  progress: WeeklyRoutineCycleProgress,
): Promise<void> {
  await AsyncStorage.setItem(CYCLE_PROGRESS_KEY, JSON.stringify(progress))
}

// 저장된 슬롯 기반 루틴 사이클 진행 상태를 불러오고 없거나 깨지면 기본값을 반환
export async function loadWeeklyRoutineCycleProgress(
  fallbackCycleStartDateKey: string,
): Promise<WeeklyRoutineCycleProgress> {
  const raw = await AsyncStorage.getItem(CYCLE_PROGRESS_KEY)
  const parsed = raw
    ? parseJsonOrNull<Partial<WeeklyRoutineCycleProgress>>(raw)
    : null

  return normalizeWeeklyRoutineCycleProgress(parsed, fallbackCycleStartDateKey)
}

// 현재 루틴 사이클 진행 상태를 초기화
export async function resetWeeklyRoutineCycleProgress(
  cycleStartDateKey: string,
): Promise<WeeklyRoutineCycleProgress> {
  const progress = createWeeklyRoutineCycleProgress(cycleStartDateKey)
  await saveWeeklyRoutineCycleProgress(progress)
  return progress
}

// 저장 완료된 운동이 선택한 루틴 슬롯을 채웠음을 기록
export async function markWeeklyRoutineSlotFilled(
  slotId: string,
): Promise<WeeklyRoutineCycleProgress | null> {
  const { startDateKey } = getThisWeekDateRange()
  const [settings, featureStatus] = await Promise.all([
    loadWeeklyRoutineSettings(),
    loadWeeklyRoutineFeatureStatus(),
  ])

  if (featureStatus !== "enabled") {
    return null
  }

  const normalizedSettings = normalizeWeeklyRoutineSettings(
    settings ?? createDefaultWeeklyRoutineSettings(startDateKey),
    startDateKey,
  )
  const currentProgress = await loadWeeklyRoutineCycleProgress(
    normalizedSettings.cycleStartDateKey,
  )
  const nextProgress = fillWeeklyRoutineSlotProgress(
    normalizedSettings,
    currentProgress,
    slotId,
  )

  await saveWeeklyRoutineCycleProgress(nextProgress)
  return nextProgress
}

// 저장소 값이 깨졌거나 예전 형식이면 마이그레이션 로직에서 보정하도록 null 반환
function parseWeeklyRoutineFeatureStatus(
  raw: string | null,
): WeeklyRoutineFeatureStatus | null {
  if (raw === "unasked" || raw === "enabled" || raw === "disabled") {
    return raw
  }

  return null
}

// 최초 안내 모달에서 사용자가 루틴 사용 여부를 선택한 결과를 저장
export async function saveWeeklyRoutineFeatureStatus(
  status: WeeklyRoutineFeatureStatus,
): Promise<void> {
  await AsyncStorage.setItem(FEATURE_STATUS_KEY, status)
}

// 저장된 선택 상태를 불러오고, 기존 루틴 설정만 있는 사용자 상태를 보정
export async function loadWeeklyRoutineFeatureStatus(): Promise<WeeklyRoutineFeatureStatus> {
  const [rawStatus, settings] = await Promise.all([
    AsyncStorage.getItem(FEATURE_STATUS_KEY),
    loadWeeklyRoutineSettings(),
  ])

  return resolveWeeklyRoutineFeatureStatus(
    parseWeeklyRoutineFeatureStatus(rawStatus),
    settings !== null,
  )
}

// 루틴 안내 모달 노출 상태를 불러옴. 이전 저장값에는 기본값을 보강
export async function loadWeeklyRoutinePromptState(): Promise<WeeklyRoutinePromptState> {
  const raw = await AsyncStorage.getItem(PROMPT_KEY)
  if (!raw) {
    return DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE
  }

  const parsed = parseJsonOrNull<Partial<WeeklyRoutinePromptState>>(raw)
  if (!parsed) {
    return DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE
  }

  return {
    cycleRenewalDismissedForWeekStartDateKey:
      parsed.cycleRenewalDismissedForWeekStartDateKey ?? null,
  }
}

// 루틴 안내 모달 노출 상태를 AsyncStorage에 저장
export async function saveWeeklyRoutinePromptState(
  state: WeeklyRoutinePromptState,
): Promise<void> {
  await AsyncStorage.setItem(PROMPT_KEY, JSON.stringify(state))
}

// 사이클 종료 안내 모달을 해당 주차에 다시 보이지 않게 기록
export async function dismissWeeklyRoutineCycleRenewalPrompt(
  weekStartDateKey: string,
): Promise<void> {
  const current = await loadWeeklyRoutinePromptState()
  await saveWeeklyRoutinePromptState({
    ...current,
    cycleRenewalDismissedForWeekStartDateKey: weekStartDateKey,
  })
}
