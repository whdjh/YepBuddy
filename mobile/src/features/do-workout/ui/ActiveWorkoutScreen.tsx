import { useState } from "react"
import { Alert, ScrollView } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import type { BodyPart, RoutinePart } from "@/entities/workout-session"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  registerWorkoutToCalendar,
  scheduleWorkoutReminder22h,
  useWorkout,
} from "@/entities/workout-session"
import { useHealthKitWorkout } from "@/features/do-workout/lib/useHealthKitWorkout"
import { useWorkoutTimer } from "@/features/do-workout/lib/useWorkoutTimer"
import { useRoutineProgress } from "@/features/do-workout/model/useRoutineProgress"
import { Main } from "@/shared/ui/Main"
import { StatsSection } from "./StatsSection"
import { BodyPartSelector } from "./BodyPartSelector"
import { RoutineSessionPicker } from "./RoutineSessionPicker"
import { SetCountList } from "./SetCountList"
import { MemoSection } from "./MemoSection"
import { WorkoutDrawer, BUTTONS_HEIGHT } from "./WorkoutDrawer"

export function ActiveWorkoutScreen() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const routineProgress = useRoutineProgress()
  const [expandedBodyPart, setExpandedBodyPart] = useState<BodyPart | null>(null)

  const handleSelectSlot = (parts: RoutinePart[]) => {
    applyBodyPartTemplate(parts)
    setExpandedBodyPart(parts[0]?.part ?? null)
  }
  const {
    state,
    toggleBodyPart,
    toggleBodyPartDetail,
    applyBodyPartTemplate,
    updateSetCount,
    updateMemo,
    pauseWorkout,
    resumeWorkout,
    completeWorkout,
    resetWorkout,
  } = useWorkout()
  const {
    endWorkout,
    pauseWorkout: pauseHealthKit,
    resumeWorkout: resumeHealthKit,
  } = useHealthKitWorkout()
  const { timerDisplay } = useWorkoutTimer(state)

  const bottomPadding = Math.max(insets.bottom, 24)

  const handlePauseToggle = async () => {
    if (state.phase === "paused") {
      resumeWorkout()
      await resumeHealthKit()
      return
    }

    pauseWorkout()
    await pauseHealthKit()
  }

  const handleComplete = async () => {
    if (!state.startedAt || !state.sessionId) {
      return
    }

    const completedSession = await completeWorkout()
    if (!completedSession) {
      return
    }

    await endWorkout({
      startedAt: completedSession.startedAt,
      endedAt: completedSession.completedAt,
      activeKcal: state.activeKcal,
      totalKcal: state.totalKcal,
    })
    await registerWorkoutToCalendar({
      startedAt: completedSession.startedAt,
      completedAt: completedSession.completedAt,
      memo: completedSession.memo,
      bodyParts: completedSession.bodyParts,
    })
    await scheduleWorkoutReminder22h(completedSession.completedAt)
    router.replace(
      `/workout/${encodeURIComponent(completedSession.sessionId)}?fromWorkout=1`,
    )
  }

  const handleDiscard = () => {
    Alert.alert(
      t("workout.active.discardTitle"),
      t("workout.active.discardMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("workout.active.discardWorkout"),
          style: "destructive",
          onPress: () => {
            void resetWorkout().then(() => {
              router.replace("/")
            })
          },
        },
      ],
    )
  }

  return (
    <Main className="workout-mode">
      <ScrollView
        className="grow"
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 84 + BUTTONS_HEIGHT + bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <StatsSection
          heartRate={state.heartRate}
          activeKcal={state.activeKcal}
          totalKcal={state.totalKcal}
        />
        {!routineProgress.isLoading && (
          <RoutineSessionPicker
            progress={routineProgress.progress}
            onSelectSlot={handleSelectSlot}
          />
        )}
        <BodyPartSelector
          selectedParts={state.bodyParts}
          onToggle={toggleBodyPart}
          onToggleDetail={toggleBodyPartDetail}
          expandedPart={expandedBodyPart}
        />
        <SetCountList
          selectedParts={state.bodyParts}
          onUpdate={updateSetCount}
        />
        <MemoSection
          value={state.memo}
          onChangeText={updateMemo}
        />
      </ScrollView>

      <WorkoutDrawer
        timerDisplay={timerDisplay}
        isPaused={state.phase === "paused"}
        representativeBodyPart={state.bodyParts[0]?.part ?? null}
        onTempo={() => router.push("/(tabs)/tempo?fromWorkout=1")}
        onTogglePause={() => void handlePauseToggle()}
        onEnd={() => void handleComplete()}
        onDiscard={handleDiscard}
        bottomPadding={bottomPadding}
      />
    </Main>
  )
}
