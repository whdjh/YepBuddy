import type {
  WeeklyRoutinePromptState,
  WeeklyRoutineSettings,
} from "../model/weeklyRoutine"
import { getElapsedWeeksBetweenDateKeys } from "@/shared/lib/date"

export type WeeklyRoutineSetupPromptKind = "onboarding" | "cycleComplete"

export interface WeeklyRoutineCycleState {
  currentWeekNumber: number
  totalCycleWeeks: number
  isDeloadWeek: boolean
  isCycleComplete: boolean
}

interface WeeklyRoutineSetupPromptInput {
  settings: WeeklyRoutineSettings | null
  promptState: WeeklyRoutinePromptState
  currentWeekStartDateKey: string
}

// 현재 주차가 일반 루틴/디로드/사이클 완료 중 어디인지 계산
export function getWeeklyRoutineCycleState(
  settings: WeeklyRoutineSettings,
  currentWeekStartDateKey: string,
): WeeklyRoutineCycleState {
  const regularWeeks = Math.max(1, settings.regularWeeks)
  const deloadWeeks = Math.max(0, settings.deloadWeeks)
  const totalCycleWeeks = regularWeeks + deloadWeeks
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
      currentWeekNumber > regularWeeks,
    isCycleComplete,
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

// 루틴 설정 또는 사이클 갱신 안내 모달을 보여줄지 판단
export function shouldShowWeeklyRoutineSetupPrompt({
  settings,
  promptState,
  currentWeekStartDateKey,
}: WeeklyRoutineSetupPromptInput): WeeklyRoutineSetupPromptKind | null {
  if (!settings) {
    return promptState.onboardingDismissedAt ? null : "onboarding"
  }

  const cycleState = getWeeklyRoutineCycleState(
    settings,
    currentWeekStartDateKey,
  )

  if (!cycleState.isCycleComplete) {
    return null
  }

  return promptState.cycleRenewalDismissedForWeekStartDateKey ===
    currentWeekStartDateKey
    ? null
    : "cycleComplete"
}
