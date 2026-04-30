import { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import {
  getWorkoutBodyPartSetLabel,
  type StoredWorkoutSession,
} from "@/entities/workout-session"
import {
  bodyPartDetailLabel,
  bodyPartLabel,
  formatDateWithDay,
} from "@/shared/lib/format"
import { Main } from "@/shared/ui/Main"
import { useLatestSession } from "../model/useLatestSession"
import { useThisWeekSessions } from "../model/useThisWeekSessions"
import { useTodayCompleted } from "../model/useTodayCompleted"
import { useTodaySummary } from "../model/useTodaySummary"
import { useSummaryCardLayout } from "../model/useSummaryCardLayout"
import { useWeeklyRoutinePlan } from "../model/useWeeklyRoutinePlan"
import { buildWeeklySessionRows } from "../model/weeklySessionRows"
import {
  getSummaryCardWidth,
  type SummaryCardId,
} from "../model/summaryCardLayout"
import { TodayWorkoutCard } from "./TodayWorkoutCard"
import { StatCard } from "@/shared/ui/StatCard"
import { SessionLinkCard } from "./SessionLinkCard"
import { WorkoutLinkCard } from "./WorkoutLinkCard"
import { WeeklySessionList } from "./WeeklySessionList"
import { EditableSummaryCardFrame } from "./EditableSummaryCardFrame"
import { SummaryCardEditModal } from "./SummaryCardEditModal"
import { WeeklyRoutineSettingsSheet } from "./WeeklyRoutineSettingsSheet"
import { WeeklyRoutineSetupPromptModal } from "./WeeklyRoutineSetupPromptModal"

function getBodyPartsLabel(
  session: StoredWorkoutSession | null,
  fallback: string,
) {
  if (!session || session.bodyParts.length === 0) {
    return fallback
  }

  return session.bodyParts
    .map((item) =>
      getWorkoutBodyPartSetLabel(item, {
        bodyPartLabel,
        bodyPartDetailLabel,
      }),
    )
    .join(", ")
}

function getRepresentativeBodyPart(session: StoredWorkoutSession | null) {
  return session?.bodyParts[0]?.part ?? null
}

export function SummaryScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const [isEditing, setIsEditing] = useState(false)
  const [isCardPickerOpen, setIsCardPickerOpen] = useState(false)
  const [isWeeklyRoutineSettingsOpen, setIsWeeklyRoutineSettingsOpen] =
    useState(false)
  const { data: todaySummary, isLoading: isTodaySummaryLoading } =
    useTodaySummary()
  const { data: latestSession } = useLatestSession()
  const { data: weekSessions } = useThisWeekSessions()
  const todayCompleted = useTodayCompleted()
  const weeklyRoutinePlan = useWeeklyRoutinePlan()
  const {
    cardRows,
    availableCards,
    addCard,
    removeCard,
    moveCard,
  } = useSummaryCardLayout()

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
  const weeklySessions = buildWeeklySessionRows({
    weekSessions,
    progress: weeklyRoutinePlan.progress,
    fallbackBodyPartLabel: t("workout.result.unspecified"),
    plannedLabel: t("workout.weeklyRoutine.status.pending"),
    formatDate: formatDateWithDay,
    bodyPartLabel,
    bodyPartDetailLabel,
  })
  const hiddenCardIds = availableCards
    .filter((card) => !card.isVisible)
    .map((card) => card.id)
  const enterEditMode = () => setIsEditing(true)

  function renderSummaryCard(cardId: SummaryCardId) {
    switch (cardId) {
      case "todayWorkout":
        return (
          <TodayWorkoutCard
            bodyParts={getBodyPartsLabel(
              todaySummary.storedSession,
              t("workout.result.unspecified"),
            )}
            representativeBodyPart={todayRepresentativeBodyPart}
            totalSets={todaySummary.totalSets}
            targetSets={Math.max(24, todaySummary.totalSets || 24)}
            onLongPress={enterEditMode}
          />
        )
      case "workoutTime":
        return (
          <StatCard
            label={t("summary.workoutTime")}
            subtitle={t("summary.today")}
            value={isTodaySummaryLoading ? "--" : todayDurationMin}
            unit={t("summary.minuteUnit")}
            onLongPress={enterEditMode}
          />
        )
      case "sets":
        return (
          <StatCard
            label={t("summary.sets")}
            subtitle={t("summary.today")}
            value={isTodaySummaryLoading ? "--" : todaySummary.totalSets}
            unit={t("summary.setsUnit")}
            onLongPress={enterEditMode}
          />
        )
      case "latestSession":
        return (
          <SessionLinkCard
            bodyPart={latestSessionBodyParts}
            representativeBodyPart={latestSessionRepresentativeBodyPart}
            kcal="--"
            day={latestSessionDay}
            onLongPress={enterEditMode}
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
            onLongPress={enterEditMode}
          />
        )
      case "weeklySessions":
        return (
          <WeeklySessionList
            sessions={weeklySessions}
            onLongPress={enterEditMode}
            onMorePress={() => router.push("/sessions")}
            onSessionPress={(sessionId) =>
              router.push(`/workout/${encodeURIComponent(sessionId)}`)
            }
          />
        )
    }
  }

  function renderEditableSummaryCard(cardId: SummaryCardId) {
    return (
      <EditableSummaryCardFrame
        key={cardId}
        isEditing={isEditing}
        onDrag={(direction) => moveCard(cardId, direction)}
        onRemove={() => removeCard(cardId)}
      >
        {renderSummaryCard(cardId)}
      </EditableSummaryCardFrame>
    )
  }

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
        <View className="flex-row items-center justify-between pt-yb-4 pb-yb-1">
          <Text className="text-yb-fg text-yb-display tracking-yb-tight">{t("summary.title")}</Text>
          <View className="flex-row items-center gap-yb-2">
            {isEditing && (
              <Pressable
                className="h-9 justify-center rounded-yb-md bg-yb-fill-pale px-yb-4"
                onPress={() => setIsEditing(false)}
              >
                <Text className="text-yb-body-sm font-semibold text-yb-fg-secondary">
                  {t("summary.done", { defaultValue: "완료" })}
                </Text>
              </Pressable>
            )}
            <Pressable
              className="h-9 justify-center rounded-yb-md bg-yb-fill-pale px-yb-4"
              onPress={() => setIsCardPickerOpen(true)}
            >
              <Text className="text-yb-body-sm font-semibold text-yb-fg-secondary">
                {t("summary.editSummary")}
              </Text>
            </Pressable>
          </View>
        </View>
        <Text className="text-yb-fg-secondary text-yb-label mb-yb-6">{dateString}</Text>

        {cardRows.length === 0 && (
          <View className="mb-yb-4 rounded-yb-xl border border-yb-border bg-yb-surface/70 p-yb-6">
            <Text className="text-center text-yb-body-md font-semibold text-yb-fg-secondary">
              {t("summary.noCards", {
                defaultValue: "표시 중인 카드가 없습니다.",
              })}
            </Text>
          </View>
        )}

        {cardRows.map((row) => {
          const rowKey = row.join(":")
          const isHalfRow =
            row.length > 1 || getSummaryCardWidth(row[0]) === "half"

          return (
            <View
              key={rowKey}
              className={`${isHalfRow ? "flex-row gap-yb-4" : ""} mb-yb-4`}
            >
              {row.map((cardId) => (
                <View
                  key={cardId}
                  className={isHalfRow ? "basis-0 grow" : undefined}
                >
                  {renderEditableSummaryCard(cardId)}
                </View>
              ))}
              {isHalfRow && row.length === 1 && <View className="basis-0 grow" />}
            </View>
          )
        })}
      </ScrollView>

      <SummaryCardEditModal
        cards={hiddenCardIds}
        renderCardPreview={renderSummaryCard}
        visible={isCardPickerOpen}
        onAddCard={(cardId) => {
          addCard(cardId)
          setIsCardPickerOpen(false)
        }}
        onClose={() => setIsCardPickerOpen(false)}
      />
      <WeeklyRoutineSettingsSheet
        plan={weeklyRoutinePlan}
        visible={isWeeklyRoutineSettingsOpen}
        onClose={() => setIsWeeklyRoutineSettingsOpen(false)}
      />
      <WeeklyRoutineSetupPromptModal
        plan={weeklyRoutinePlan}
        visible={
          Boolean(weeklyRoutinePlan.setupPromptKind) &&
          !weeklyRoutinePlan.isLoading &&
          !isWeeklyRoutineSettingsOpen
        }
        onPressSettings={() => setIsWeeklyRoutineSettingsOpen(true)}
      />
    </Main>
  )
}
