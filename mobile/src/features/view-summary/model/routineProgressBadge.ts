import type { WeeklyRoutineProgress } from "@/entities/workout-session"

/** 요약 카드 루틴 진행 배지 값 */
export interface RoutineProgressBadge {
  current: number
  total: number
}

/** 요약 카드 루틴 진행 배지 계산 */
export function getRoutineProgressBadge(
  progress: Pick<WeeklyRoutineProgress, "slots" | "totalSessions">,
): RoutineProgressBadge | undefined {
  // 표시 가능한 루틴 세션 부재
  if (progress.totalSessions <= 0) {
    return undefined
  }

  // 첫 번째 미완료 루틴 슬롯
  const currentSlot = progress.slots.find(
    (slot) => slot.status !== "completed",
  )

  // 현재 루틴 회차와 전체 루틴 회차
  return {
    current: currentSlot ? currentSlot.index + 1 : progress.totalSessions,
    total: progress.totalSessions,
  }
}
