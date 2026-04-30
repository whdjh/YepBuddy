import { useEffect, useState } from "react"
import { Modal, Pressable, ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import {
  BODY_PART_DETAILS,
  createDefaultWeeklyRoutineSettings,
  resizeWeeklyRoutineSessions,
  type BodyPart,
  type BodyPartDetail,
  type RoutinePart,
  type WeeklyRoutineSettings,
} from "@/entities/workout-session"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"
import type { WeeklyRoutinePlanResult } from "../model/useWeeklyRoutinePlan"

const ALL_BODY_PARTS: BodyPart[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
]

interface WeeklyRoutineSettingsSheetProps {
  plan: WeeklyRoutinePlanResult
  visible: boolean
  onClose: () => void
}

interface CycleStepperProps {
  label: string
  value: number
  min: number
  onChange: (value: number) => void
}

// details 배열에서 특정 detail을 토글
function toggleDetail(
  current: RoutinePart[],
  part: BodyPart,
  detail: BodyPartDetail,
) {
  return current.map((item) => {
    if (item.part !== part) return item
    const details = item.details ?? []
    return {
      ...item,
      details: details.includes(detail)
        ? details.filter((value) => value !== detail)
        : [...details, detail],
    }
  })
}

function CycleStepper({ label, value, min, onChange }: CycleStepperProps) {
  const decrementDisabled = value <= min

  return (
    <View className="flex-row items-center justify-between rounded-yb-md border border-yb-border bg-yb-fill-pale px-yb-4 py-yb-3">
      <Text className="text-yb-body-sm font-semibold text-yb-fg">
        {label}
      </Text>
      <View className="flex-row items-center gap-yb-3">
        <Pressable
          disabled={decrementDisabled}
          className={`h-yb-8 w-yb-8 items-center justify-center rounded-full border ${
            decrementDisabled
              ? "border-yb-border bg-yb-surface/50"
              : "border-yb-accent bg-yb-surface"
          }`}
          onPress={() => onChange(Math.max(min, value - 1))}
        >
          <Text
            className={`text-yb-body-md font-semibold ${
              decrementDisabled ? "text-yb-fg-tertiary" : "text-yb-accent"
            }`}
          >
            -
          </Text>
        </Pressable>
        <Text className="min-w-yb-6 text-center text-yb-body-md font-semibold text-yb-fg">
          {value}
        </Text>
        <Pressable
          className="h-yb-8 w-yb-8 items-center justify-center rounded-full border border-yb-accent bg-yb-surface"
          onPress={() => onChange(value + 1)}
        >
          <Text className="text-yb-body-md font-semibold text-yb-accent">
            +
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

// 주간 루틴 세션 편집 바텀시트
export function WeeklyRoutineSettingsSheet({
  plan,
  visible,
  onClose,
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

  const updateCycleWeeks = (
    field: "regularWeeks" | "deloadWeeks",
    value: number,
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
      sessions:
        field === "regularWeeks"
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
    updateSessionParts(index, toggleDetail(currentParts, part, detail))
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end" onPress={onClose}>
        <Pressable
          className="max-h-[86%] rounded-t-yb-xl bg-yb-surface px-yb-6 pt-yb-4"
          onPress={() => {}}
        >
          <View className="mb-yb-6 h-yb-1 w-yb-10 self-center rounded-full bg-yb-border" />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-yb-10"
          >
            <Text className="mb-yb-4 text-yb-title font-semibold text-yb-fg">
              {t("workout.weeklyRoutine.settings.title")}
            </Text>
            <View className="mb-yb-4 gap-yb-2">
              <CycleStepper
                label={t("workout.weeklyRoutine.settings.regularWeeks")}
                min={1}
                value={draft.regularWeeks}
                onChange={(value) => updateCycleWeeks("regularWeeks", value)}
              />
              <CycleStepper
                label={t("workout.weeklyRoutine.settings.deloadWeeks")}
                min={0}
                value={draft.deloadWeeks}
                onChange={(value) => updateCycleWeeks("deloadWeeks", value)}
              />
              <Text className="text-yb-caption text-yb-fg-tertiary">
                {t("workout.weeklyRoutine.settings.cycleHelp")}
              </Text>
            </View>
            <View className="gap-yb-4">
              {draft.sessions.map((session, index) => (
                <View
                  key={session.id}
                  className="rounded-yb-md border border-yb-border bg-yb-fill-pale px-yb-4 py-yb-3"
                >
                  <Text className="mb-yb-3 text-yb-body-sm font-semibold text-yb-fg">
                    {index + 1}
                  </Text>
                  <View className="flex-row flex-wrap gap-yb-2">
                    {ALL_BODY_PARTS.map((part) => {
                      const active = session.parts.some((item) => item.part === part)
                      return (
                        <Pressable
                          key={part}
                          onPress={() => handleTogglePart(index, part)}
                          className={`rounded-yb-md border px-yb-3 py-yb-2 ${
                            active
                              ? "border-yb-accent bg-yb-accent"
                              : "border-yb-border bg-yb-surface"
                          }`}
                        >
                          <Text
                          className={`text-yb-caption font-semibold ${
                              active ? "text-yb-on-accent" : "text-yb-fg-secondary"
                            }`}
                          >
                            {bodyPartLabel(part)}
                          </Text>
                        </Pressable>
                      )
                    })}
                  </View>
                  {session.parts.map((routinePart) => {
                    const details = BODY_PART_DETAILS[routinePart.part]
                    if (details.length === 0) return null

                    return (
                      <View key={routinePart.part} className="mt-yb-3">
                        <Text className="mb-yb-2 text-yb-caption font-semibold text-yb-fg-tertiary">
                          {bodyPartLabel(routinePart.part)}
                        </Text>
                        <View className="flex-row flex-wrap gap-yb-2">
                          {details.map((detail) => {
                            const active = routinePart.details?.includes(detail) ?? false
                            return (
                              <Pressable
                                key={detail}
                                onPress={() => handleToggleDetail(index, routinePart.part, detail)}
                                className={`rounded-full border px-yb-3 py-yb-1 ${
                                  active
                                    ? "border-yb-accent bg-yb-accent"
                                    : "border-yb-border bg-yb-surface"
                                }`}
                              >
                                <Text
                                  className={`text-yb-caption ${
                                    active ? "text-yb-on-accent" : "text-yb-fg-secondary"
                                  }`}
                                >
                                  {bodyPartDetailLabel(detail)}
                                </Text>
                              </Pressable>
                            )
                          })}
                        </View>
                      </View>
                    )
                  })}
                </View>
              ))}
            </View>
            <Pressable
              onPress={handleSave}
              className="mt-yb-6 items-center rounded-yb-md bg-yb-accent py-yb-3"
            >
              <Text className="font-semibold text-yb-on-accent">
                {t("workout.weeklyRoutine.settings.save")}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
