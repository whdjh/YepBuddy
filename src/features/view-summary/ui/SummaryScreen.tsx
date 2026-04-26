import { ScrollView, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import type { StoredWorkoutSession } from "@/entities/workout-session"
import { bodyPartLabel, formatDateWithDay } from "@/shared/lib/format"
import { Main } from "@/shared/ui/Main"
import { useLatestSession } from "../model/useLatestSession"
import { useThisWeekSessions } from "../model/useThisWeekSessions"
import { useTodayCompleted } from "../model/useTodayCompleted"
import { useTodaySummary } from "../model/useTodaySummary"
import { TodayWorkoutCard } from "./TodayWorkoutCard"
import { StatCard } from "@/shared/ui/StatCard"
import { SessionLinkCard } from "./SessionLinkCard"
import { WorkoutLinkCard } from "./WorkoutLinkCard"
import { WeeklySessionList } from "./WeeklySessionList"

function getBodyPartsLabel(
  session: StoredWorkoutSession | null,
  fallback: string,
) {
  if (!session || session.bodyParts.length === 0) {
    return fallback
  }

  return session.bodyParts.map((item) => bodyPartLabel(item.part)).join(", ")
}

function getSessionSetCount(session: StoredWorkoutSession | null) {
  if (!session) {
    return 0
  }

  return session.bodyParts.reduce((sum, item) => sum + item.setCount, 0)
}

function getRepresentativeBodyPart(session: StoredWorkoutSession | null) {
  return session?.bodyParts[0]?.part ?? null
}

function getSessionDurationMinutes(session: StoredWorkoutSession | null) {
  if (!session) {
    return 0
  }

  const startedAtMs = new Date(session.startedAt).getTime()
  const completedAtMs = new Date(session.completedAt).getTime()

  if (Number.isNaN(startedAtMs) || Number.isNaN(completedAtMs)) {
    return 0
  }

  return Math.max(0, Math.round((completedAtMs - startedAtMs) / 60000))
}

export function SummaryScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: todaySummary, isLoading: isTodaySummaryLoading } =
    useTodaySummary()
  const { data: latestSession } = useLatestSession()
  const { data: weekSessions } = useThisWeekSessions()
  const todayCompleted = useTodayCompleted()

  const todayDate = new Date()
  const dateString = formatDateWithDay(todayDate)
  const todayDurationMin = Math.round(todaySummary.totalDuration / 60)
  const latestSessionBodyParts = getBodyPartsLabel(
    latestSession,
    t("workout.result.unspecified"),
  )
  const todayRepresentativeBodyPart = getRepresentativeBodyPart(
    todaySummary.storedSession,
  )
  const latestSessionRepresentativeBodyPart =
    getRepresentativeBodyPart(latestSession)
  const latestSessionDay = latestSession
    ? formatDateWithDay(new Date(latestSession.startedAt))
    : t("summary.today")
  const weeklySessions = weekSessions.map((session) => ({
    sessionId: session.sessionId,
    bodyPart: getBodyPartsLabel(session, t("workout.result.unspecified")),
    representativeBodyPart: getRepresentativeBodyPart(session),
    day: formatDateWithDay(new Date(session.startedAt)),
    durationMin: getSessionDurationMinutes(session),
    sets: getSessionSetCount(session),
    kcal: "--",
  }))

  return (
    <Main>
      <LinearGradient
        colors={["#FAF7F2", "#EDE4D6", "#DDD2BF", "#EDE4D6", "#FAF7F2"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        className="absolute inset-0"
      />
      <ScrollView
        className="grow"
        contentContainerClassName="px-yb-5 pb-yb-30"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View className="pt-yb-4 pb-yb-1">
          <Text className="text-yb-fg text-yb-display tracking-yb-tight">{t("summary.title")}</Text>
        </View>
        <Text className="text-yb-fg-secondary text-yb-label mb-yb-6">{dateString}</Text>

        {/* 오늘의 운동 카드 */}
        <View className="mb-yb-4">
          <TodayWorkoutCard
            bodyParts={getBodyPartsLabel(
              todaySummary.storedSession,
              t("workout.result.unspecified"),
            )}
            representativeBodyPart={todayRepresentativeBodyPart}
            totalSets={todaySummary.totalSets}
            targetSets={Math.max(24, todaySummary.totalSets || 24)}
          />
        </View>

        {/* 운동시간 / 세트수 */}
        <View className="flex-row gap-yb-4 mb-yb-4">
          <View className="flex-1">
            <StatCard
              label={t("summary.workoutTime")}
              subtitle={t("summary.today")}
              value={isTodaySummaryLoading ? "--" : todayDurationMin}
              unit={t("summary.minuteUnit")}
            />
          </View>
          <View className="flex-1">
            <StatCard
              label={t("summary.sets")}
              subtitle={t("summary.today")}
              value={isTodaySummaryLoading ? "--" : todaySummary.totalSets}
              unit={t("summary.setsUnit")}
            />
          </View>
        </View>

        {/* 세션 카드 / 운동 카드 */}
        <View className="flex-row gap-yb-4 mb-yb-4">
          <View className="flex-1">
            <SessionLinkCard
              bodyPart={latestSessionBodyParts}
              representativeBodyPart={latestSessionRepresentativeBodyPart}
              kcal="--"
              day={latestSessionDay}
              onPress={
                latestSession
                  ? () =>
                      router.push(
                        `/workout/${encodeURIComponent(latestSession.sessionId)}`,
                      )
                  : undefined
              }
            />
          </View>
          <View className="flex-1">
            <WorkoutLinkCard disabled={todayCompleted} />
          </View>
        </View>

        {/* 이번 주 세션 */}
        <View className="mb-yb-6">
          <WeeklySessionList
            sessions={weeklySessions}
            onMorePress={() => router.push("/sessions")}
            onSessionPress={(sessionId) =>
              router.push(`/workout/${encodeURIComponent(sessionId)}`)
            }
          />
        </View>
      </ScrollView>
    </Main>
  )
}
