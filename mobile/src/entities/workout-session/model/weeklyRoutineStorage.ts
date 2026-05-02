import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE,
  resolveWeeklyRoutineFeatureStatus,
  type WeeklyRoutineFeatureStatus,
  type WeeklyRoutinePromptState,
  type WeeklyRoutineSettings,
} from "./weeklyRoutine"

const KEY = "yb:workout:weekly-routine"
const FEATURE_STATUS_KEY = "yb:workout:weekly-routine-feature-status"
const PROMPT_KEY = "yb:workout:weekly-routine-prompt"

// 주간 루틴 설정을 AsyncStorage에 저장
export async function saveWeeklyRoutineSettings(
  settings: WeeklyRoutineSettings,
): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings))
}

// 저장된 주간 루틴 설정을 불러옴. 없으면 null 반환
export async function loadWeeklyRoutineSettings(): Promise<WeeklyRoutineSettings | null> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as WeeklyRoutineSettings) : null
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

  const parsed = JSON.parse(raw) as Partial<WeeklyRoutinePromptState>
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
