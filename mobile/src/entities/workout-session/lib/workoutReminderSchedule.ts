type GetNextWorkoutReminderDateOptions = {
  hasCompletedWorkoutToday?: boolean
  now?: Date
}

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
