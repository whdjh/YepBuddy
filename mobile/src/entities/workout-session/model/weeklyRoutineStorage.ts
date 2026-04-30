import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  DEFAULT_WEEKLY_ROUTINE_PROMPT_STATE,
  type WeeklyRoutinePromptState,
  type WeeklyRoutineSettings,
} from "./weeklyRoutine"

const KEY = "yb:workout:weekly-routine"
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
