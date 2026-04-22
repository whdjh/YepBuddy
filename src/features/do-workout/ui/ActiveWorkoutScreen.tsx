import { ScrollView } from "react-native"
import { router } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  registerWorkoutToCalendar,
  scheduleWorkoutReminder22h,
  useWorkout,
} from "@/entities/workout-session"
import { useHealthKitWorkout } from "@/features/do-workout/lib/useHealthKitWorkout"
import { useWorkoutTimer } from "@/features/do-workout/lib/useWorkoutTimer"
import { Main } from "@/shared/ui/Main"
import { StatsSection } from "./StatsSection"
import { BodyPartSelector } from "./BodyPartSelector"
import { SetCountList } from "./SetCountList"
import { MemoSection } from "./MemoSection"
import { WorkoutDrawer, BUTTONS_HEIGHT } from "./WorkoutDrawer"

export function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets()
  const {
    state,
    toggleBodyPart,
    updateSetCount,
    updateMemo,
    pauseWorkout,
    resumeWorkout,
    completeWorkout,
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

  return (
    <Main className="workout-mode">
      <ScrollView
        className="flex-1"
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
        <BodyPartSelector
          selectedParts={state.bodyParts.map(({ part }) => part)}
          onToggle={toggleBodyPart}
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
        onTempo={() => router.push("/(tabs)/tempo?fromWorkout=1")}
        onTogglePause={() => void handlePauseToggle()}
        onEnd={() => void handleComplete()}
        bottomPadding={bottomPadding}
      />
    </Main>
  )
}
