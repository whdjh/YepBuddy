import { useEffect, useMemo, useRef, useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import {
  getNextRoutineSuggestion,
  type RoutinePart,
  type WeeklyRoutineProgress,
  type WeeklyRoutineSession,
} from "@/entities/workout-session"
import { bodyPartLabel } from "@/shared/lib/format"

interface RoutineSessionPickerProps {
  progress: WeeklyRoutineProgress
  onSelectSlot: (parts: RoutinePart[]) => void
}

function getRoutineLabel(parts: RoutinePart[]) {
  return parts.map((part) => bodyPartLabel(part.part)).join("/")
}

export function RoutineSessionPicker({
  progress,
  onSelectSlot,
}: RoutineSessionPickerProps) {
  const { t } = useTranslation()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )
  const didAutoSelectRef = useRef(false)

  const nextSuggestion = useMemo(
    () => getNextRoutineSuggestion(progress),
    [progress],
  )
  const hasAvailableRoutine = progress.slots.some(
    (slot) => slot.status !== "completed",
  )

  useEffect(() => {
    if (didAutoSelectRef.current || !nextSuggestion) {
      return
    }

    didAutoSelectRef.current = true
    setSelectedSessionId(nextSuggestion.id)
    onSelectSlot(nextSuggestion.parts)
  }, [nextSuggestion, onSelectSlot])

  const handleSelectSlot = (routineSession: WeeklyRoutineSession) => {
    setSelectedSessionId(routineSession.id)
    onSelectSlot(routineSession.parts)
  }

  return (
    <View className="px-yb-6 mb-yb-5">
      <Text className="text-yb-fg font-bold text-yb-body-lg mb-yb-4">
        {t("workout.active.routinePicker.title")}
      </Text>

      {hasAvailableRoutine ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-[10px] pl-1"
        >
          {progress.slots.map((slot) => {
            const disabled = slot.status === "completed"
            const active =
              !disabled && selectedSessionId === slot.routineSession.id

            return (
              <Pressable
                key={`${slot.routineSession.id}-${slot.index}`}
                disabled={disabled}
                className={`h-yb-chip rounded-yb-chip border-yb-input px-[18px] items-center justify-center ${
                  active
                    ? "bg-yb-accent border-yb-accent"
                    : "bg-yb-fill-pale border-yb-border"
                } ${disabled ? "opacity-40" : ""}`}
                onPress={() => handleSelectSlot(slot.routineSession)}
              >
                <Text
                  className={`text-yb-body-sm ${
                    active
                      ? "text-yb-on-accent font-medium"
                      : "text-yb-fg"
                  }`}
                >
                  {getRoutineLabel(slot.routineSession.parts)}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      ) : (
        <Text className="text-yb-body-md font-semibold text-yb-fg-secondary">
          {t("workout.weeklyRoutine.suggestion.complete")}
        </Text>
      )}
    </View>
  )
}
