import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"
import { useWeeklyRoutinePlan } from "@/entities/workout-session/model/useWeeklyRoutinePlan"
import { formatDateWithDay, bodyPartLabel, bodyPartDetailLabel } from "@/shared/lib/format"
import { useThisWeekSessions } from "./useThisWeekSessions"
import { useTodayCompleted } from "./useTodayCompleted"
import { useTodaySummary } from "./useTodaySummary"
import { buildWeeklySessionRows } from "./weeklySessionRows"
import { getBodyPartsLabel, getRepresentativeBodyPart } from "./summaryHelpers"
import { getRoutineProgressBadge } from "./routineProgressBadge"

export function useSummaryCardData() {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: todaySummary, isLoading: isTodaySummaryLoading } =
    useTodaySummary()
  const { data: weekSessions } = useThisWeekSessions()
  const todayCompleted = useTodayCompleted()
  const weeklyRoutinePlan = useWeeklyRoutinePlan()
  const fallbackBodyPartLabel = t("workout.result.unspecified")
  const todayDurationMin = Math.round(todaySummary.totalDuration / 60)
  const todayTotalSets = todaySummary.totalSets
  const todaySummaryStoredSession = todaySummary.storedSession
  const todayBodyParts = getBodyPartsLabel(
    todaySummaryStoredSession,
    fallbackBodyPartLabel,
  )
  const todayRepresentativeBodyPart = getRepresentativeBodyPart(
    todaySummaryStoredSession,
  )
  const bodyPartCardSession = todaySummaryStoredSession
  const bodyPartCardBodyParts = todayBodyParts
  const bodyPartCardRepresentativeBodyPart = todayRepresentativeBodyPart
  const bodyPartCardDay = t("summary.today")
  const weeklySessions = buildWeeklySessionRows({
    weekSessions,
    progress: weeklyRoutinePlan.progress,
    fallbackBodyPartLabel,
    plannedLabel: t("workout.weeklyRoutine.status.pending"),
    formatDate: formatDateWithDay,
    bodyPartLabel,
    bodyPartDetailLabel,
  })
  const routineProgress =
    weeklyRoutinePlan.isRoutineEnabled
      ? getRoutineProgressBadge(weeklyRoutinePlan.cycleState)
      : undefined

  return {
    router,
    t,
    isTodaySummaryLoading,
    todayDurationMin,
    todayTotalSets,
    todayBodyParts,
    todayRepresentativeBodyPart,
    todaySummaryStoredSession,
    bodyPartCardSession,
    bodyPartCardBodyParts,
    bodyPartCardRepresentativeBodyPart,
    bodyPartCardDay,
    todayCompleted,
    weeklySessions,
    weeklyRoutinePlan,
    routineProgress,
  }
}
