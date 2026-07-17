import { useState } from "react"
import { Alert, Platform, ScrollView } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  BODY_PART_DETAILS,
  getNextBodyPartsAfterDetailToggle,
  getNextBodyPartsAfterPartToggle,
  processCompletedWorkoutCalendarAutoAdd,
  syncWorkoutReminderAtNight,
  updateStoredWorkoutHealthKitMetrics,
  useWorkout,
  type BodyPart,
  type BodyPartDetail,
  type RoutineCycleSession,
  type WorkoutBodyPartSet,
  type WorkoutState,
} from "@/entities/workout-session"
import { useHealthKitWorkout } from "@/features/do-workout/lib/useHealthKitWorkout"
import { useWorkoutHistoryPrefill } from "@/features/do-workout/model/useWorkoutHistoryPrefill"
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

type WorkoutLiveMetricsState = Pick<
  WorkoutState,
  "heartRate" | "activeKcal" | "totalKcal"
>

export function ActiveWorkoutContent() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const routineProgress = useRoutineProgress()
  const historyPrefill = useWorkoutHistoryPrefill(routineProgress.isDeloadCycle)
  const [expandedBodyPart, setExpandedBodyPart] = useState<BodyPart | null>(null)
  const [selectedRoutineSessionId, setSelectedRoutineSessionId] = useState<
    string | null
  >(null)
  const [memoPlaceholder, setMemoPlaceholder] = useState<string | null>(null)
  const {
    state,
    applyBodyPartSets,
    updateSetCount,
    updateMemo,
    startCardio,
    pauseWorkout,
    resumeWorkout,
    completeWorkout,
    resetWorkout,
  } = useWorkout()
  const {
    discardWorkout: discardHealthKitWorkout,
    endWorkout,
    pauseWorkout: pauseHealthKit,
    resumeWorkout: resumeHealthKit,
  } = useHealthKitWorkout()

  const minimumBottomPadding = Platform.OS === "android" ? 36 : 24
  const bottomPadding = Math.max(insets.bottom, minimumBottomPadding)
  const { heartRate, activeKcal, totalKcal }: WorkoutLiveMetricsState = state
  const hasLiveMetrics =
    heartRate != null || activeKcal > 0 || totalKcal > 0

  // 이전 기록 프리필 결과 중 세트 수는 상태에 적용하고 메모는 placeholder로만 보관
  const applyPrefill = (
    bodyParts: WorkoutBodyPartSet[],
    nextMemoPlaceholder: string | null,
  ) => {
    applyBodyPartSets(bodyParts)
    setMemoPlaceholder(nextMemoPlaceholder)
  }

  // 수동 상위 부위 선택 변경 시 동일 구성의 이전 기록 프리필 적용
  const handleToggleBodyPart = (part: BodyPart) => {
    const isSelected = state.bodyParts.some((item) => item.part === part)
    const nextBodyParts = getNextBodyPartsAfterPartToggle(state.bodyParts, part)
    const prefill = historyPrefill.getPrefill(nextBodyParts)
    applyPrefill(prefill.bodyParts, prefill.memoPlaceholder)
    setExpandedBodyPart((current) => {
      if (isSelected) {
        return current === part ? null : current
      }

      return BODY_PART_DETAILS[part].length > 0 ? part : null
    })
  }

  // 수동 세부 부위 선택 변경 시 동일 구성의 이전 기록 프리필 적용
  const handleToggleBodyPartDetail = (
    part: BodyPart,
    detail: BodyPartDetail,
  ) => {
    const nextBodyParts = getNextBodyPartsAfterDetailToggle(
      state.bodyParts,
      part,
      detail,
    )
    const prefill = historyPrefill.getPrefill(nextBodyParts)
    applyPrefill(prefill.bodyParts, prefill.memoPlaceholder)
  }

  // 루틴 슬롯 선택 시 해당 슬롯 구성과 같은 이전 기록 프리필 적용
  const handleSelectSlot = (routineSession: RoutineCycleSession) => {
    setSelectedRoutineSessionId(routineSession.id)

    const prefill = historyPrefill.getRoutinePrefill(routineSession.parts)
    applyPrefill(prefill.bodyParts, prefill.memoPlaceholder)
    setExpandedBodyPart(routineSession.parts[0]?.part ?? null)
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

    const completedSession = await completeWorkout({
      isDeload: routineProgress.isDeloadCycle,
    })
    if (!completedSession) {
      return
    }

    if (selectedRoutineSessionId) {
      await routineProgress
        .markSlotFilled(selectedRoutineSessionId)
        .catch(() => undefined)
    }

    const endedWorkout = await endWorkout({
      startedAt: completedSession.startedAt,
      endedAt: completedSession.completedAt,
      activeKcal,
      totalKcal,
    }).catch(() => false)
    if (endedWorkout && typeof endedWorkout !== "boolean") {
      await updateStoredWorkoutHealthKitMetrics(completedSession.sessionId, {
        averageHeartRate: endedWorkout.averageHeartRate,
        healthKitWorkoutUUID: endedWorkout.healthKitWorkoutUUID,
      }).catch(() => undefined)
    }
    await syncWorkoutReminderAtNight({ allowPrompt: false }).catch(
      () => false,
    )

    await processCompletedWorkoutCalendarAutoAdd(
      completedSession,
      "foreground",
    ).catch(() => false)

    router.replace({
      pathname: "/workout/[id]",
      params: {
        id: completedSession.sessionId,
        fromWorkout: "1",
      },
    })
  }

  const discardWorkoutAndGoHome = async () => {
    try {
      await discardHealthKitWorkout().catch(() => false)
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
        {hasLiveMetrics && (
          <StatsSection
            heartRate={heartRate}
            activeKcal={activeKcal}
            totalKcal={totalKcal}
          />
        )}
        {!routineProgress.isLoading && routineProgress.isRoutineEnabled && (
          <RoutineSessionPicker
            progress={routineProgress.progress}
            nextSuggestion={routineProgress.nextSuggestion}
            onSelectSlot={handleSelectSlot}
          />
        )}
        <BodyPartSelector
          selectedParts={state.bodyParts}
          onToggle={handleToggleBodyPart}
          onToggleDetail={handleToggleBodyPartDetail}
          expandedPart={expandedBodyPart}
          onExpandedPartChange={setExpandedBodyPart}
        />
        <SetCountList
          selectedParts={state.bodyParts}
          onUpdate={updateSetCount}
        />
        <MemoSection
          value={state.memo}
          placeholder={memoPlaceholder}
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
