import type { WeeklyRoutineCycleState } from "@/entities/workout-session"

/** 요약 카드 루틴 진행 배지 값 */
export interface RoutineProgressBadge {
  current: number
  total: number
}

/** 요약 카드 루틴 진행 배지 계산 */
export function getRoutineProgressBadge(
  cycleState: WeeklyRoutineCycleState | null,
): RoutineProgressBadge | undefined {
  if (!cycleState || cycleState.totalCycleWeeks <= 0) {
    return undefined
  }

  return {
    current: Math.min(
      cycleState.currentWeekNumber,
      cycleState.totalCycleWeeks,
    ),
    total: cycleState.totalCycleWeeks,
  }
}
