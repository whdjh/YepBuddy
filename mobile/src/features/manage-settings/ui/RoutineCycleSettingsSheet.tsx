import { useEffect, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, View } from "react-native"
import {
  GestureHandlerRootView,
  Pressable as GesturePressable,
} from "react-native-gesture-handler"
import { useTranslation } from "react-i18next"
import {
  createDefaultRoutineCycleSettings,
  MAX_ROUTINE_CYCLE_SPLIT_COUNT,
  MIN_ROUTINE_CYCLE_SPLIT_COUNT,
  resizeRoutineCycleSessions,
  type BodyPart,
  type BodyPartDetail,
  type RoutinePart,
  type RoutineCyclePlanResult,
  type RoutineCycleSettings,
} from "@/entities/workout-session"
import {
  CycleStepper,
  RoutineSettingsSaveButton,
  RoutineSessionPartEditor,
} from "./routine-cycle-settings/RoutineSettingsEditors"
import { toggleRoutinePartDetail } from "./routine-cycle-settings/routinePartDetail"

interface RoutineCycleSettingsSheetProps {
  plan: RoutineCyclePlanResult
  visible: boolean
  onClose: () => void
  onSaved?: () => void
}

// 루틴 사이클 세션 편집 바텀시트
export function RoutineCycleSettingsSheet({
  plan,
  visible,
  onClose,
  onSaved,
}: RoutineCycleSettingsSheetProps) {
  const { t } = useTranslation()
  const {
    canEditRoutineStructure,
    currentCycleAnchorDateKey,
    minimumTrainingCycles,
    settings,
    updateSettings,
  } = plan
  const [isSaving, setIsSaving] = useState(false)
  const [draft, setDraft] = useState<RoutineCycleSettings>(() =>
    createDefaultRoutineCycleSettings(currentCycleAnchorDateKey),
  )

  useEffect(() => {
    if (visible) {
      const nextDraft =
        settings ?? createDefaultRoutineCycleSettings(currentCycleAnchorDateKey)
      setDraft({
        ...nextDraft,
        trainingCycles: Math.max(
          nextDraft.trainingCycles,
          minimumTrainingCycles,
        ),
      })
    }
  }, [currentCycleAnchorDateKey, minimumTrainingCycles, settings, visible])

  const handleSave = async () => {
    if (isSaving) {
      return
    }

    setIsSaving(true)
    try {
      await updateSettings(draft)
      onSaved?.()
      onClose()
    } catch {
      return
    } finally {
      setIsSaving(false)
    }
  }

  const handleRequestClose = () => {
    if (isSaving) {
      return
    }

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
    field: "trainingCycles" | "deloadCycles" | "splitCount",
    value: number,
  ) => {
    if (field === "splitCount" && !canEditRoutineStructure) {
      return
    }

    setDraft((current) => ({
      ...current,
      [field]:
        field === "trainingCycles"
          ? Math.max(minimumTrainingCycles, value)
          : value,
      sessions:
        field === "splitCount"
          ? resizeRoutineCycleSessions(current.sessions, value)
          : current.sessions,
    }))
  }

  const handleTogglePart = (index: number, part: BodyPart) => {
    if (!canEditRoutineStructure) {
      return
    }

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
    if (!canEditRoutineStructure) {
      return
    }

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
      onRequestClose={handleRequestClose}
    >
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <View className="absolute inset-0 justify-end bg-black/25">
          <GesturePressable
            style={StyleSheet.absoluteFill}
            onPress={handleRequestClose}
            accessibilityRole="button"
            accessibilityLabel={t("common.close")}
          />
          <View className="z-10 max-h-[88%] rounded-t-[28px] border border-yb-border-subtle bg-yb-surface px-yb-5 pt-yb-3 shadow-yb-lg">
            <View className="mb-yb-5 h-yb-1 w-yb-12 self-center rounded-full bg-yb-border-subtle" />
            <ScrollView
              className="shrink"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-yb-5"
            >
              <Text className="mb-yb-5 text-yb-heading-sm text-yb-fg">
                {t("workout.routineCycle.settings.title")}
              </Text>
              <View className="mb-yb-5 gap-yb-2">
                <CycleStepper
                  label={t("workout.routineCycle.settings.trainingCycles")}
                  min={minimumTrainingCycles}
                  value={draft.trainingCycles}
                  onChange={(value) =>
                    updateRoutineNumber("trainingCycles", value)
                  }
                />
                <CycleStepper
                  label={t("workout.routineCycle.settings.deloadCycles")}
                  min={0}
                  value={draft.deloadCycles}
                  onChange={(value) => updateRoutineNumber("deloadCycles", value)}
                />
                <CycleStepper
                  label={t("workout.routineCycle.settings.splitCount")}
                  min={MIN_ROUTINE_CYCLE_SPLIT_COUNT}
                  max={MAX_ROUTINE_CYCLE_SPLIT_COUNT}
                  disabled={!canEditRoutineStructure}
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
                    disabled={!canEditRoutineStructure}
                  />
                ))}
              </View>
            </ScrollView>
            <RoutineSettingsSaveButton
              label={t("workout.routineCycle.settings.save")}
              disabled={isSaving}
              onPress={handleSave}
            />
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
