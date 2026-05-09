import type { SummaryCardId } from "../model/summaryCardLayout"
import type { useSummaryCardData } from "../model/useSummaryCardData"
import { StatCard } from "@/shared/ui/StatCard"
import { TodayWorkoutCard } from "./TodayWorkoutCard"
import { SessionLinkCard } from "./SessionLinkCard"
import { WorkoutLinkCard } from "./WorkoutLinkCard"
import { WeeklySessionList } from "./WeeklySessionList"

interface Props {
  cardId: SummaryCardId
  data: ReturnType<typeof useSummaryCardData>
  onLongPress: () => void
}

export function SummaryCardRenderer({ cardId, data, onLongPress }: Props) {
  const {
    router,
    t,
    isTodaySummaryLoading,
    todayDurationMin,
    todayTotalSets,
    todayBodyParts,
    todayRepresentativeBodyPart,
    latestSession,
    latestSessionBodyParts,
    latestSessionRepresentativeBodyPart,
    latestSessionDay,
    todayCompleted,
    weeklySessions,
  } = data

  switch (cardId) {
    case "todayWorkout":
      return (
        <TodayWorkoutCard
          bodyParts={todayBodyParts}
          representativeBodyPart={todayRepresentativeBodyPart}
          totalSets={todayTotalSets}
          onLongPress={onLongPress}
        />
      )
    case "workoutTime":
      return (
        <StatCard
          label={t("summary.workoutTime")}
          subtitle={t("summary.today")}
          value={isTodaySummaryLoading ? "--" : todayDurationMin}
          unit={t("summary.minuteUnit")}
          onLongPress={onLongPress}
        />
      )
    case "sets":
      return (
        <StatCard
          label={t("summary.sets")}
          subtitle={t("summary.today")}
          value={isTodaySummaryLoading ? "--" : todayTotalSets}
          unit={t("summary.setsUnit")}
          onLongPress={onLongPress}
        />
      )
    case "latestSession":
      return (
        <SessionLinkCard
          bodyPart={latestSessionBodyParts}
          representativeBodyPart={latestSessionRepresentativeBodyPart}
          kcal="--"
          day={latestSessionDay}
          onLongPress={onLongPress}
          onPress={
            latestSession
              ? () =>
                  router.push(
                    `/workout/${encodeURIComponent(latestSession.sessionId)}`,
                  )
              : undefined
          }
        />
      )
    case "startWorkout":
      return (
        <WorkoutLinkCard
          disabled={todayCompleted}
          onLongPress={onLongPress}
        />
      )
    case "weeklySessions":
      return (
        <WeeklySessionList
          sessions={weeklySessions}
          onLongPress={onLongPress}
          onMorePress={() => router.push("/sessions")}
          onSessionPress={(sessionId) =>
            router.push(`/workout/${encodeURIComponent(sessionId)}`)
          }
        />
      )
  }
}
