import type {
  WeeklyRoutinePromptState,
  WeeklyRoutineSettings,
} from "../model/weeklyRoutine"
import { getElapsedWeeksBetweenDateKeys } from "@/shared/lib/date"

export type WeeklyRoutineSetupPromptKind = "cycleComplete"

// 루틴 사이클의 현재 표시 상태
export type WeeklyRoutineCyclePhase = "regular" | "deload" | "complete"

// 현재 주차 기준 루틴 사이클 계산 결과
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

// 현재 주차가 훈련/디로드/사이클 완료 중 어디인지 계산
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
}: WeeklyRoutineSetupPromptInput): WeeklyRoutineSetupPromptKind | null {
  if (!settings) {
    return null
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
