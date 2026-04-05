import { useCallback, useMemo } from "react"
import { ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Main } from "@/shared/ui/Main"
import { IconButton } from "@/shared/ui/IconButton"
import { generateMonths } from "@/shared/lib/date"
import { MonthGrid } from "./MonthGrid"

const INITIAL_MONTH_COUNT = 6
const DAY_HEADER_KEYS = [0, 1, 2, 3, 4, 5, 6] as const

// Mock: dates with workouts → session IDs
const MOCK_WORKOUT_DATES: Record<string, string> = {
  // April 2026
  "2026-4-1": "sa1",
  "2026-4-3": "sa2",
  "2026-4-5": "sa3",
  // March 2026
  "2026-3-1": "s20",
  "2026-3-2": "s19",
  "2026-3-3": "s18",
  "2026-3-5": "s8",
  "2026-3-7": "s7",
  "2026-3-10": "s6",
  "2026-3-11": "s5",
  "2026-3-12": "s4",
  "2026-3-13": "s3",
  "2026-3-14": "s2",
  "2026-3-15": "s1",
  "2026-3-17": "s22",
  // February 2026
  "2026-2-2": "s30",
  "2026-2-4": "s31",
  "2026-2-7": "s33",
  "2026-2-9": "s34",
  "2026-2-11": "s35",
  "2026-2-13": "s36",
  "2026-2-15": "s37",
  "2026-2-17": "s38",
  "2026-2-21": "s40",
  "2026-2-25": "s42",
  "2026-2-27": "s43",
  // January 2026
  "2026-1-3": "s50",
  "2026-1-5": "s51",
  "2026-1-7": "s52",
  "2026-1-12": "s54",
  "2026-1-14": "s55",
  "2026-1-18": "s57",
  "2026-1-22": "s59",
  "2026-1-24": "s60",
  "2026-1-28": "s62",
  "2026-1-31": "s64",
}

export function CalendarScreen() {
  const router = useRouter()
  
  const { t } = useTranslation()

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

  const today = useMemo(() => {
    const now = new Date()
  
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    }
  }, [])

  const months = useMemo(() => generateMonths(INITIAL_MONTH_COUNT), [])

  const handleDayPress = useCallback(
    (year: number, month: number, day: number) => {
      const key = `${year}-${month}-${day}`
      const sessionId = MOCK_WORKOUT_DATES[key]
      if (sessionId) {
        router.push(`/workout/${sessionId}`)
      }
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
            workoutDates={MOCK_WORKOUT_DATES}
            trackColor={ringTrackColor}
            fillColor={accentColor}
            successColor={successColor}
            onDayPress={handleDayPress}
          />
        ))}
      </ScrollView>
    </Main>
  )
}
