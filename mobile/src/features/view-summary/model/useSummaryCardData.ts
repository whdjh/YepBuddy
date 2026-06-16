import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"
import { useRoutineCyclePlan } from "@/entities/workout-session"
import { formatDateWithDay, bodyPartLabel, bodyPartDetailLabel } from "@/shared/lib/format"
import { useTodayCompleted } from "./useTodayCompleted"
import { useTodaySummary } from "./useTodaySummary"
import { buildRoutineCycleSessionRows } from "./routineCycleSessionRows"
import { getBodyPartsLabel, getRepresentativeBodyPart } from "./summaryHelpers"
import { getRoutineProgressBadge } from "./routineProgressBadge"

export function useSummaryCardData() {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: todaySummary, isLoading: isTodaySummaryLoading } =
    useTodaySummary()
  const todayCompleted = useTodayCompleted()
  const routineCyclePlan = useRoutineCyclePlan()
  const fallbackBodyPartLabel = t("workout.result.unspecified")
  const todayDurationMin = Math.round(todaySummary.totalDuration / 60)
  const todayTotalSets = todaySummary.totalSets
  const todaySummaryStoredSession = todaySummary.storedSession
  const todayBodyParts = getBodyPartsLabel(
    todaySummaryStoredSession,
    fallbackBodyPartLabel,
    t("workout.calendar.cardio"),
  )
  const todayRepresentativeBodyPart = getRepresentativeBodyPart(
    todaySummaryStoredSession,
  )
  const isTodayWorkoutDeload = todaySummaryStoredSession?.isDeload === true
  const bodyPartCardSession = todaySummaryStoredSession
  const bodyPartCardBodyParts = todayBodyParts
  const bodyPartCardRepresentativeBodyPart = todayRepresentativeBodyPart
  const bodyPartCardDay = t("summary.today")
  const routineCycleSessions = buildRoutineCycleSessionRows({
    progress: routineCyclePlan.progress,
    deloadLabel: t("workout.routineCycle.status.deload"),
    fallbackBodyPartLabel,
    isDeloadCycle: routineCyclePlan.isDeloadCycle,
    plannedLabel: t("workout.routineCycle.status.pending"),
    formatDate: formatDateWithDay,
    bodyPartLabel,
    bodyPartDetailLabel,
  })
  const routineProgress =
    routineCyclePlan.isRoutineEnabled
      ? getRoutineProgressBadge(routineCyclePlan.cycleState)
      : undefined

  return {
    router,
    t,
    isTodaySummaryLoading,
    todayDurationMin,
    todayTotalSets,
    todayBodyParts,
    todayRepresentativeBodyPart,
    isTodayWorkoutDeload,
    todaySummaryStoredSession,
    bodyPartCardSession,
    bodyPartCardBodyParts,
    bodyPartCardRepresentativeBodyPart,
    bodyPartCardDay,
    todayCompleted,
    routineCycleSessions,
    routineCyclePlan,
    routineProgress,
    isRoutineDeloadCycle: routineCyclePlan.isDeloadCycle,
  }
}
