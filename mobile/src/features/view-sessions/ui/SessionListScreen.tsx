import { Fragment, useCallback, useMemo, useState } from "react"
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { SymbolView } from "@/shared/ui/SymbolView"
import { Main } from "@/shared/ui/Main"
import { IconButton } from "@/shared/ui/IconButton"
import { formatMonthYear } from "@/shared/lib/format"
import { groupByMonth } from "@/shared/lib/group"
import { filterSessions } from "../model/filterSessions"
import { useInfiniteSessions } from "../model/useInfiniteSessions"
import type { SessionFilterValue } from "../model/types"
import { FilterTabs } from "./FilterTabs"
import { SessionCard } from "./SessionCard"

export function SessionListScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { fg: fgColor } = useCardColors()
  const { sessions, isLoadingInitial, isLoadingMore, loadMore } =
    useInfiniteSessions()

  const [activeFilter, setActiveFilter] = useState<SessionFilterValue>("all")

  const filteredSessions = useMemo(() => {
    return filterSessions(sessions, activeFilter)
  }, [activeFilter, sessions])

  const grouped = useMemo(() => groupByMonth(filteredSessions), [filteredSessions])

  const handleSessionPress = useCallback(
    (sessionId: string) => {
      router.push(`/workout/${encodeURIComponent(sessionId)}`)
    },
    [router],
  )

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height)

    if (distanceFromBottom < 240) {
      void loadMore()
    }
  }

  return (
    <Main>
      {/* 헤더 */}
      <View className="flex-row items-center px-yb-5 pt-yb-2 pb-yb-1">
        <IconButton
          accessibilityLabel={t("common.back")}
          variant="back-square"
          onPress={() => router.back()}
        >
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text className="text-yb-fg text-yb-heading-sm font-bold text-center" style={{ flex: 1 }}>
          {t("sessions.title")}
        </Text>
        <View className="w-yb-icon-btn" />
      </View>

      {/* 필터 */}
      <FilterTabs value={activeFilter} onChange={setActiveFilter} />

      {/* 세션 리스트 */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerClassName="px-yb-5 pt-yb-2 pb-yb-30"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {isLoadingInitial && grouped.size === 0 ? (
          <View className="items-center justify-center py-yb-12">
            <ActivityIndicator color={fgColor} />
          </View>
        ) : null}

        {!isLoadingInitial && grouped.size === 0 ? (
          <Text className="text-yb-fg-secondary text-yb-body-sm">
            {t("workout.result.noData")}
          </Text>
        ) : null}

        {Array.from(grouped.entries()).map(([monthKey, sessions]) => (
          <Fragment key={monthKey}>
            <Text className="text-yb-fg text-yb-heading-sm font-bold mb-yb-4">
              {formatMonthYear(sessions[0].date)}
            </Text>

            {sessions.map((session) => (
              <SessionCard
                key={session.sessionId}
                sessionId={session.sessionId}
                bodyParts={session.bodyParts}
                kcal={session.kcal}
                date={session.date}
                onPress={handleSessionPress}
              />
            ))}
          </Fragment>
        ))}

        {isLoadingMore ? (
          <View className="items-center py-yb-4">
            <ActivityIndicator color={fgColor} />
          </View>
        ) : null}
      </ScrollView>
    </Main>
  )
}
