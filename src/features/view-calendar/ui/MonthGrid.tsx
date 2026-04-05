import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { getFirstDayOfWeek, getDaysInMonth } from "@/shared/lib/date"
import { DayCell } from "./DayCell"

interface MonthGridProps {
  year: number
  month: number
  today: { year: number; month: number; day: number }
  workoutDates: Record<string, string>
  trackColor: string
  fillColor: string
  successColor: string
  onDayPress: (year: number, month: number, day: number) => void
}

export function MonthGrid({
  year,
  month,
  today,
  workoutDates,
  trackColor,
  fillColor,
  successColor,
  onDayPress,
}: MonthGridProps) {
  const { t } = useTranslation()

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
          const dateKey = `${year}-${month}-${day}`
          const hasWorkout = dateKey in workoutDates
          const isToday = year === today.year && month === today.month && day === today.day
          const isFuture =
            year > today.year ||
            (year === today.year && month > today.month) ||
            (year === today.year &&
              month === today.month &&
              day > today.day)

          return (
            <DayCell
              key={day}
              day={day}
              isToday={isToday}
              hasWorkout={hasWorkout}
              disabled={isFuture || !hasWorkout}
              trackColor={trackColor}
              fillColor={fillColor}
              successColor={successColor}
              onPress={() => onDayPress(year, month, day)}
            />
          )
        })}
      </View>
    </View>
  )
}
