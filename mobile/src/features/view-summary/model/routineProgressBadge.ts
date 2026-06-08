import type { RoutineCycleState } from "@/entities/workout-session"

/** 요약 카드 루틴 진행 배지 값 */
export interface RoutineProgressBadge {
  current: number
  total: number
}

/** 요약 카드 루틴 진행 배지 계산 */
export function getRoutineProgressBadge(
  cycleState: RoutineCycleState | null,
): RoutineProgressBadge | undefined {
  if (!cycleState || cycleState.totalCycleCount <= 0) {
    return undefined
  }

  return {
    current: Math.min(
      cycleState.currentCycleNumber,
      cycleState.totalCycleCount,
    ),
    total: cycleState.totalCycleCount,
  }
}
