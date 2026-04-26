import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { getFirstDayOfWeek, getDaysInMonth } from "@/shared/lib/date"
import { useMonthWorkoutDates } from "../model/useMonthWorkoutDates"
import { DayCell } from "./DayCell"

interface MonthGridProps {
  year: number
  month: number
  today: { year: number; month: number; day: number }
  refreshKey: number
  onDayPress: (sessionId: string) => void
}

export function MonthGrid({
  year,
  month,
  today,
  refreshKey,
  onDayPress,
}: MonthGridProps) {
  const { t } = useTranslation()
  const { workoutDates } = useMonthWorkoutDates(year, month, refreshKey)

  const firstDay = getFirstDayOfWeek(year, month)
  const daysCount = getDaysInMonth(year, month)

  return (
    <View className="mb-yb-8">
      <Text className="text-yb-fg text-yb-heading-md text-right mb-yb-3">
        {t("sessions.monthHeader", { year, month })}
      </Text>

      <View className="flex-row flex-wrap">
        {Array.from({ length: firstDay }).map((_, i) => (
          <View
            key={`empty-${i}`}
            style={{ width: "14.285%", minHeight: 68 }}
          />
        ))}

        {Array.from({ length: daysCount }).map((_, i) => {
          const day = i + 1
          const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
          const dayWorkout = workoutDates[dateKey] ?? null
          const bodyParts = dayWorkout?.bodyParts ?? []
          const isToday = year === today.year && month === today.month && day === today.day
          const isFuture =
            year > today.year ||
            (year === today.year && month > today.month) ||
            (year === today.year && month === today.month && day > today.day)

          return (
            <DayCell
              key={day}
              day={day}
              isToday={isToday}
              bodyParts={bodyParts}
              disabled={isFuture || !dayWorkout}
              onPress={() => {
                if (dayWorkout) {
                  onDayPress(dayWorkout.sessionId)
                }
              }}
            />
          )
        })}
      </View>
    </View>
  )
}
