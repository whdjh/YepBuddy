import { useCallback } from "react"
import { ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Main } from "@/shared/ui/Main"
import { IconButton } from "@/shared/ui/IconButton"
import { getDateParts } from "../lib/getTodayParts"
import { useCalendarRefreshSignal } from "../model/useCalendarRefreshSignal"
import { useInfiniteMonths } from "../model/useInfiniteMonths"
import { MonthGrid } from "./MonthGrid"

const DAY_HEADER_KEYS = [0, 1, 2, 3, 4, 5, 6] as const

export function CalendarScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { anchorDate, refreshKey } = useCalendarRefreshSignal()
  const months = useInfiniteMonths(anchorDate)
  const today = getDateParts(anchorDate)

  const fgColor =
    (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"
  const accentColor =
    (useUnstableNativeVariable("--yb-accent") as unknown as string) ||
    "#9B7E56"
  const ringTrackColor =
    (useUnstableNativeVariable("--yb-ring-track") as unknown as string) ||
    "#EDE4D6"
  const successColor =
    (useUnstableNativeVariable(
      "--yb-status-success-bright",
    ) as unknown as string) || "#43C251"

  const handleDayPress = useCallback(
    (sessionId: string) => {
      router.push(`/workout/${encodeURIComponent(sessionId)}`)
    },
    [router],
  )

  return (
    <Main>
      {/* 헤더 */}
      <View className="flex-row items-center px-yb-5 pt-yb-2 pb-yb-1 gap-yb-3">
        <IconButton variant="back-square" onPress={() => router.back()}>
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

      {/* 요일 헤더 */}
      <View className="flex-row px-yb-5 pt-yb-3 pb-yb-2">
        {DAY_HEADER_KEYS.map((i) => (
          <View key={i} style={{ width: "14.285%" }} className="items-center">
            <Text className="text-yb-fg-secondary text-yb-caption font-semibold">
              {t(`common.daysShort.${i}`)}
            </Text>
          </View>
        ))}
      </View>

      {/* 월별 캘린더 */}
      <ScrollView
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
            trackColor={ringTrackColor}
            fillColor={accentColor}
            successColor={successColor}
            refreshKey={refreshKey}
            onDayPress={handleDayPress}
          />
        ))}
      </ScrollView>
    </Main>
  )
}
