import { Fragment, useMemo, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Main } from "@/shared/ui/Main"
import { IconButton } from "@/shared/ui/IconButton"
import { FilterPill } from "@/shared/ui/Chip"
import { formatMonthYear, bodyPartLabel } from "@/shared/lib/format"
import { groupByMonth } from "@/shared/lib/group"
import { SessionCard } from "./SessionCard"

interface SessionItem {
  id: string
  bodyParts: string[]
  kcal: number
  date: Date
}

const BODY_PART_KEYS = ["chest", "back", "legs", "shoulders", "arms", "core"] as const

// Mock data — bodyParts use i18n keys
const MOCK_SESSIONS: SessionItem[] = [
  { id: "s1", bodyParts: ["chest"], kcal: 262, date: new Date(2026, 2, 15) },
  { id: "s2", bodyParts: ["back"], kcal: 279, date: new Date(2026, 2, 14) },
  { id: "s3", bodyParts: ["legs"], kcal: 232, date: new Date(2026, 2, 13) },
  { id: "s4", bodyParts: ["shoulders"], kcal: 210, date: new Date(2026, 2, 12) },
  { id: "s5", bodyParts: ["chest", "back"], kcal: 328, date: new Date(2026, 2, 11) },
  { id: "s6", bodyParts: ["back"], kcal: 270, date: new Date(2026, 2, 10) },
  { id: "s7", bodyParts: ["legs"], kcal: 257, date: new Date(2026, 2, 7) },
  { id: "s8", bodyParts: ["arms"], kcal: 198, date: new Date(2026, 2, 5) },
]

export function SessionListScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const fgColor = (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"

  const [activeFilter, setActiveFilter] = useState<string>("all")

  const filteredSessions = useMemo(() => {
    if (activeFilter === "all") return MOCK_SESSIONS
    return MOCK_SESSIONS.filter((s) => s.bodyParts.includes(activeFilter))
  }, [activeFilter])

  const grouped = useMemo(() => groupByMonth(filteredSessions), [filteredSessions])

  return (
    <Main>
      {/* 헤더 */}
      <View className="flex-row items-center px-yb-5 pt-yb-2 pb-yb-1">
        <IconButton variant="back-square" onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text className="text-yb-fg text-yb-heading-sm font-bold text-center" style={{ flex: 1 }}>
          {t("sessions.title")}
        </Text>
        <View className="w-yb-icon-btn" />
      </View>

      {/* 필터 */}
      <View className="pt-yb-2 pb-yb-1">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-yb-5 gap-yb-2"
        >
          <FilterPill
            label={t("sessions.filterAll")}
            variant={activeFilter === "all" ? "active" : "default"}
            onPress={() => setActiveFilter("all")}
          />
          {BODY_PART_KEYS.map((key) => (
            <FilterPill
              key={key}
              label={bodyPartLabel(key)}
              variant={activeFilter === key ? "active" : "default"}
              onPress={() => setActiveFilter(key)}
            />
          ))}
        </ScrollView>
      </View>

      {/* 세션 리스트 */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerClassName="px-yb-5 pt-yb-2 pb-yb-30"
        showsVerticalScrollIndicator={false}
      >
        {Array.from(grouped.entries()).map(([monthKey, sessions]) => (
          <Fragment key={monthKey}>
            <Text className="text-yb-fg text-yb-heading-sm font-bold mb-yb-4">
              {formatMonthYear(sessions[0].date)}
            </Text>

            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                bodyParts={session.bodyParts}
                kcal={session.kcal}
                date={session.date}
                onPress={() => router.push(`/workout/${session.id}`)}
              />
            ))}
          </Fragment>
        ))}
      </ScrollView>
    </Main>
  )
}
