import { useCallback } from "react"
import { ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { SymbolView } from "@/shared/ui/SymbolView"
import { Chip } from "@/shared/ui/Chip"
import { Main } from "@/shared/ui/Main"
import { IconButton } from "@/shared/ui/IconButton"
import { getDateParts } from "../lib/getTodayParts"
import { useCalendarRefreshSignal } from "../model/useCalendarRefreshSignal"
import { useCalendarYearSelection } from "../model/useCalendarYearSelection"
import { MonthGrid } from "./MonthGrid"

const DAY_HEADER_KEYS = [0, 1, 2, 3, 4, 5, 6] as const

export function CalendarScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { anchorDate, refreshKey } = useCalendarRefreshSignal()
  const { months, selectedYear, setSelectedYear, years } =
    useCalendarYearSelection(anchorDate)
  const today = getDateParts(anchorDate)

  const { fg: fgColor } = useCardColors()

  const handleDayPress = useCallback(
    (sessionId: string) => {
      router.push(`/workout/${encodeURIComponent(sessionId)}`)
    },
    [router],
  )

  return (
    <Main>
      <View className="flex-row items-center px-yb-5 pt-yb-2 pb-yb-1 gap-yb-3">
        <IconButton
          accessibilityLabel={t("common.back")}
          variant="back-square"
          onPress={() => router.back()}
        >
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text
          className="text-yb-fg text-yb-heading-md text-center"
          style={{ flex: 1 }}
        >
          {t("calendar.title")}
        </Text>
        <View className="w-yb-icon-btn" />
      </View>

      <View className="pt-yb-3 pb-yb-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-yb-5 gap-yb-2"
        >
          {years.map((year) => (
            <Chip
              key={year}
              label={String(year)}
              variant={selectedYear === year ? "active" : "default"}
              onPress={() => setSelectedYear(year)}
              accessibilityRole="button"
              accessibilityLabel={String(year)}
              accessibilityState={{ selected: selectedYear === year }}
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-row px-yb-5 pt-yb-2 pb-yb-2">
        {DAY_HEADER_KEYS.map((i) => (
          <View key={i} style={{ width: "14.285%" }} className="items-center">
            <Text className="text-yb-fg-secondary text-yb-caption font-semibold">
              {t(`common.daysShort.${i}`)}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        key={selectedYear}
        style={{ flex: 1 }}
        contentContainerClassName="px-yb-5 pb-yb-30"
        showsVerticalScrollIndicator={false}
      >
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            today={today}
            refreshKey={refreshKey}
            onDayPress={handleDayPress}
          />
        ))}
      </ScrollView>
    </Main>
  )
}
