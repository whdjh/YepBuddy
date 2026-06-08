import { useEffect, useRef, useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import {
  type RoutinePart,
  type RoutineCycleProgress,
  type RoutineCycleSession,
} from "@/entities/workout-session"
import { bodyPartLabel } from "@/shared/lib/format"

interface RoutineSessionPickerProps {
  progress: RoutineCycleProgress
  nextSuggestion: RoutineCycleSession | null
  onSelectSlot: (routineSession: RoutineCycleSession) => void
}

function getRoutineLabel(parts: RoutinePart[]) {
  return parts.map((part) => bodyPartLabel(part.part)).join("/")
}

export function RoutineSessionPicker({
  progress,
  nextSuggestion,
  onSelectSlot,
}: RoutineSessionPickerProps) {
  const { t } = useTranslation()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  )
  const didAutoSelectRef = useRef(false)

  const hasAvailableRoutine = progress.slots.some(
    (slot) => slot.status !== "completed" && slot.status !== "substituted",
  )

  useEffect(() => {
    if (didAutoSelectRef.current || !nextSuggestion) {
      return
    }

    const nextSuggestionSlot = progress.slots.find(
      (slot) => slot.routineSession.id === nextSuggestion.id,
    )
    if (!nextSuggestionSlot) {
      return
    }

    didAutoSelectRef.current = true
    setSelectedSessionId(nextSuggestionSlot.routineSession.id)
    onSelectSlot(nextSuggestionSlot.routineSession)
  }, [nextSuggestion, onSelectSlot, progress.slots])

  const handleSelectSlot = (routineSession: RoutineCycleSession) => {
    setSelectedSessionId(routineSession.id)
    onSelectSlot(routineSession)
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
            const disabled =
              slot.status === "completed" || slot.status === "substituted"
            const active =
              !disabled && selectedSessionId === slot.routineSession.id

            return (
              <Pressable
                key={`${slot.routineSession.id}-${slot.index}`}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={getRoutineLabel(slot.routineSession.parts)}
                accessibilityState={{ disabled, selected: active }}
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
          {t("workout.routineCycle.suggestion.complete")}
        </Text>
      )}
    </View>
  )
}
