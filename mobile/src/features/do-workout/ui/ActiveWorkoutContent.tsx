import { useState } from "react"
import { Alert, ScrollView } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import type { BodyPart, RoutinePart } from "@/entities/workout-session"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  registerWorkoutToCalendar,
  syncWorkoutReminderAtNight,
  useWorkout,
} from "@/entities/workout-session"
import { useHealthKitWorkout } from "@/features/do-workout/lib/useHealthKitWorkout"
import { useRoutineProgress } from "@/features/do-workout/model/useRoutineProgress"
import { Main } from "@/shared/ui/Main"
import { StatsSection } from "./StatsSection"
import { BodyPartSelector } from "./BodyPartSelector"
import { RoutineSessionPicker } from "./RoutineSessionPicker"
import { SetCountList } from "./SetCountList"
import { MemoSection } from "./MemoSection"
import {
  WorkoutDrawer,
  BUTTONS_HEIGHT,
  DRAWER_VISIBLE_HEIGHT,
} from "./WorkoutDrawer"

export function ActiveWorkoutContent() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const routineProgress = useRoutineProgress()
  const [expandedBodyPart, setExpandedBodyPart] = useState<BodyPart | null>(null)
  const {
    state,
    toggleBodyPart,
    toggleBodyPartDetail,
    applyBodyPartTemplate,
    updateSetCount,
    updateMemo,
    startCardio,
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

  const bottomPadding = Math.max(insets.bottom, 24)

  const handleSelectSlot = (parts: RoutinePart[]) => {
    applyBodyPartTemplate(parts)
    setExpandedBodyPart(parts[0]?.part ?? null)
  }

  const handlePauseToggle = async () => {
    if (state.phase !== "recording" && state.phase !== "paused") {
      return
    }

    if (state.phase === "paused") {
      resumeWorkout()
      await resumeHealthKit().catch(() => undefined)
      return
    }

    pauseWorkout()
    await pauseHealthKit().catch(() => undefined)
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
    }).catch(() => false)
    await syncWorkoutReminderAtNight({ allowPrompt: false }).catch(
      () => false,
    )

    const goToResult = () => {
      router.replace({
        pathname: "/workout/[id]",
        params: {
          id: completedSession.sessionId,
          fromWorkout: "1",
        },
      })
    }

    const addWorkoutToCalendar = async () => {
      try {
        await registerWorkoutToCalendar({
          startedAt: completedSession.startedAt,
          completedAt: completedSession.completedAt,
          cardioStartedAt: completedSession.cardioStartedAt,
          memo: completedSession.memo,
          bodyParts: completedSession.bodyParts,
          location: completedSession.location,
        })
      } finally {
        goToResult()
      }
    }

    Alert.alert(
      t("workout.calendar.addPromptTitle"),
      t("workout.calendar.addPromptBody"),
      [
        {
          text: t("workout.calendar.notNow"),
          style: "cancel",
          onPress: goToResult,
        },
        {
          text: t("workout.calendar.addAction"),
          onPress: () => {
            void addWorkoutToCalendar()
          },
        },
      ],
      { cancelable: false },
    )
  }

  const discardWorkoutAndGoHome = async () => {
    try {
      await resetWorkout()
    } finally {
      router.replace("/")
    }
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
            void discardWorkoutAndGoHome()
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
          paddingBottom: DRAWER_VISIBLE_HEIGHT + BUTTONS_HEIGHT + bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <StatsSection
          heartRate={state.heartRate}
          activeKcal={state.activeKcal}
          totalKcal={state.totalKcal}
        />
        {!routineProgress.isLoading && routineProgress.isRoutineEnabled && (
          <RoutineSessionPicker
            progress={routineProgress.progress}
            nextSuggestion={routineProgress.nextSuggestion}
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
        workoutState={state}
        isPaused={state.phase === "paused"}
        hasCardioStarted={Boolean(state.cardioStartedAt)}
        onStartCardio={startCardio}
        onTempo={() => router.push("/(tabs)/tempo?fromWorkout=1")}
        onTogglePause={() => void handlePauseToggle()}
        onEnd={() => void handleComplete()}
        onDiscard={handleDiscard}
        bottomPadding={bottomPadding}
      />
    </Main>
  )
}
