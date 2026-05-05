import { useEffect, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native"
import {
  GestureHandlerRootView,
  Pressable as GesturePressable,
} from "react-native-gesture-handler"
import { useTranslation } from "react-i18next"
import {
  createDefaultWeeklyRoutineSettings,
  MAX_WEEKLY_ROUTINE_SPLIT_COUNT,
  MIN_WEEKLY_ROUTINE_SPLIT_COUNT,
  resizeWeeklyRoutineSessions,
  type BodyPart,
  type BodyPartDetail,
  type RoutinePart,
  type WeeklyRoutineSettings,
} from "@/entities/workout-session"
import type { WeeklyRoutinePlanResult } from "@/features/view-summary/model/useWeeklyRoutinePlan"
import {
  CycleStepper,
  RoutineSettingsSaveButton,
  RoutineSessionPartEditor,
} from "./weekly-routine-settings/RoutineSettingsEditors"
import { toggleRoutinePartDetail } from "./weekly-routine-settings/routinePartDetail"

interface WeeklyRoutineSettingsSheetProps {
  plan: WeeklyRoutinePlanResult
  visible: boolean
  onClose: () => void
  onSaved?: () => void
}

// 주간 루틴 세션 편집 바텀시트
export function WeeklyRoutineSettingsSheet({
  plan,
  visible,
  onClose,
  onSaved,
}: WeeklyRoutineSettingsSheetProps) {
  const { t } = useTranslation()
  const { currentWeekStartDateKey, settings, updateSettings } = plan
  const [draft, setDraft] = useState<WeeklyRoutineSettings>(() =>
    createDefaultWeeklyRoutineSettings(currentWeekStartDateKey),
  )

  useEffect(() => {
    if (visible) {
      setDraft(
        settings ?? createDefaultWeeklyRoutineSettings(currentWeekStartDateKey),
      )
    }
  }, [currentWeekStartDateKey, settings, visible])

  const handleSave = async () => {
    await updateSettings(draft)
    onSaved?.()
    onClose()
  }

  const updateSessionParts = (index: number, parts: RoutinePart[]) => {
    setDraft((current) => ({
      ...current,
      sessions: current.sessions.map((session, sessionIndex) =>
        sessionIndex === index ? { ...session, parts } : session,
      ),
    }))
  }

  const updateRoutineNumber = (
    field: "trainingWeeks" | "deloadWeeks" | "splitCount",
    value: number,
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
      sessions:
        field === "splitCount"
          ? resizeWeeklyRoutineSessions(current.sessions, value)
          : current.sessions,
    }))
  }

  const handleTogglePart = (index: number, part: BodyPart) => {
    const currentParts = draft.sessions[index]?.parts ?? []
    const exists = currentParts.some((item) => item.part === part)
    updateSessionParts(
      index,
      exists
        ? currentParts.filter((item) => item.part !== part)
        : [...currentParts, { part }],
    )
  }

  const handleToggleDetail = (
    index: number,
    part: BodyPart,
    detail: BodyPartDetail,
  ) => {
    const currentParts = draft.sessions[index]?.parts ?? []
    if (!currentParts.some((item) => item.part === part)) {
      return
    }
    updateSessionParts(
      index,
      toggleRoutinePartDetail(currentParts, part, detail),
    )
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <View className="absolute inset-0 justify-end bg-black/25">
          <GesturePressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View className="z-10 max-h-[88%] rounded-t-[28px] border border-yb-border-subtle bg-yb-surface px-yb-5 pt-yb-3 shadow-yb-lg">
            <View className="mb-yb-5 h-yb-1 w-yb-12 self-center rounded-full bg-yb-border-subtle" />
            <ScrollView
              className="shrink"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-yb-5"
            >
              <Text className="mb-yb-5 text-yb-heading-sm text-yb-fg">
                {t("workout.weeklyRoutine.settings.title")}
              </Text>
              <View className="mb-yb-5 gap-yb-2">
                <CycleStepper
                  label={t("workout.weeklyRoutine.settings.trainingWeeks")}
                  min={1}
                  value={draft.trainingWeeks}
                  onChange={(value) =>
                    updateRoutineNumber("trainingWeeks", value)
                  }
                />
                <CycleStepper
                  label={t("workout.weeklyRoutine.settings.deloadWeeks")}
                  min={0}
                  value={draft.deloadWeeks}
                  onChange={(value) => updateRoutineNumber("deloadWeeks", value)}
                />
                <CycleStepper
                  label={t("workout.weeklyRoutine.settings.splitCount")}
                  min={MIN_WEEKLY_ROUTINE_SPLIT_COUNT}
                  max={MAX_WEEKLY_ROUTINE_SPLIT_COUNT}
                  value={draft.splitCount}
                  onChange={(value) =>
                    updateRoutineNumber("splitCount", value)
                  }
                />
              </View>
              <View className="gap-yb-3">
                {draft.sessions.map((session, index) => (
                  <RoutineSessionPartEditor
                    key={session.id}
                    index={index}
                    session={session}
                    onTogglePart={handleTogglePart}
                    onToggleDetail={handleToggleDetail}
                  />
                ))}
              </View>
            </ScrollView>
            <RoutineSettingsSaveButton
              label={t("workout.weeklyRoutine.settings.save")}
              onPress={handleSave}
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
