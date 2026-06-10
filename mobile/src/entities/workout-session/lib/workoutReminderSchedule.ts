type GetNextWorkoutReminderDateOptions = {
  hasCompletedWorkoutToday?: boolean
  now?: Date
}

type WorkoutReminderBlockingSnapshot = {
  phase?: unknown
} | null | undefined

/** 다음 운동 리마인더가 울릴 22:00 시각을 계산 */
export function getNextWorkoutReminderDate({
  hasCompletedWorkoutToday = false,
  now = new Date(),
}: GetNextWorkoutReminderDateOptions = {}) {
  const reminderDate = new Date(now)
  reminderDate.setHours(22, 0, 0, 0)

  if (hasCompletedWorkoutToday || reminderDate.getTime() <= now.getTime()) {
    reminderDate.setDate(reminderDate.getDate() + 1)
  }

  return reminderDate
}

/** 진행 중 운동이 있으면 22:00 운동 리마인더 예약 방지 */
export function hasActiveWorkoutReminderBlock(
  snapshot: WorkoutReminderBlockingSnapshot,
) {
  return (
    snapshot?.phase === "countdown" ||
    snapshot?.phase === "recording" ||
    snapshot?.phase === "paused"
  )
}
