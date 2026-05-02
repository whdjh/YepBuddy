import { cssInterop } from "nativewind"
import { Text, View } from "react-native"
import { Pressable as GesturePressable } from "react-native-gesture-handler"
import {
  BODY_PART_DETAILS,
  type BodyPart,
  type BodyPartDetail,
  type WeeklyRoutineSession,
} from "@/entities/workout-session"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"

const Pressable = cssInterop(GesturePressable, { className: "style" })

const ALL_BODY_PARTS: BodyPart[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
]

interface CycleStepperProps {
  label: string
  value: number
  min: number
  onChange: (value: number) => void
}

interface RoutineSessionPartEditorProps {
  index: number
  session: WeeklyRoutineSession
  onTogglePart: (index: number, part: BodyPart) => void
  onToggleDetail: (
    index: number,
    part: BodyPart,
    detail: BodyPartDetail,
  ) => void
}

interface RoutineSettingsSaveButtonProps {
  label: string
  onPress: () => void
}

export function CycleStepper({
  label,
  value,
  min,
  onChange,
}: CycleStepperProps) {
  const decrementDisabled = value <= min

  return (
    <View className="flex-row items-center justify-between rounded-yb-xl border border-yb-border-subtle bg-yb-surface px-yb-4 py-yb-2.5 shadow-yb-sm">
      <Text className="text-yb-body-sm font-semibold text-yb-fg">
        {label}
      </Text>
      <View className="flex-row items-center rounded-full bg-yb-surface-muted p-yb-0.5">
        <Pressable
          disabled={decrementDisabled}
          className={`h-yb-8 w-yb-8 items-center justify-center rounded-full ${
            decrementDisabled
              ? "bg-yb-surface/50"
              : "bg-yb-surface shadow-yb-sm active:opacity-80"
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
        <Text className="w-yb-9 text-center text-yb-body-lg text-yb-fg">
          {value}
        </Text>
        <Pressable
          className="h-yb-8 w-yb-8 items-center justify-center rounded-full bg-yb-surface shadow-yb-sm active:opacity-80"
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

export function RoutineSettingsSaveButton({
  label,
  onPress,
}: RoutineSettingsSaveButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-yb-10 mt-yb-3 min-h-yb-btn-md items-center justify-center rounded-full bg-yb-accent px-yb-6 shadow-yb-md active:opacity-90"
    >
      <Text className="text-yb-body-lg text-yb-on-accent">{label}</Text>
    </Pressable>
  )
}

export function RoutineSessionPartEditor({
  index,
  session,
  onTogglePart,
  onToggleDetail,
}: RoutineSessionPartEditorProps) {
  return (
    <View className="rounded-yb-xl border border-yb-border-subtle bg-yb-surface px-yb-3.5 py-yb-3.5 shadow-yb-sm">
      <View className="flex-row items-center gap-yb-1.5">
        {ALL_BODY_PARTS.map((part) => {
          const active = session.parts.some((item) => item.part === part)

          return (
            <Pressable
              key={part}
              onPress={() => onTogglePart(index, part)}
              className={`h-[38px] items-center justify-center rounded-full border px-yb-2.5 ${
                active
                  ? "border-yb-accent bg-yb-accent shadow-yb-sm active:opacity-90"
                  : "border-yb-border-subtle bg-yb-surface-muted active:opacity-80"
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
          <View key={routinePart.part} className="mt-yb-4">
            <Text className="mb-yb-2 text-yb-label text-yb-fg-secondary">
              {bodyPartLabel(routinePart.part)}
            </Text>
            <View className="flex-row flex-wrap gap-yb-2">
              {details.map((detail) => {
                const active = routinePart.details?.includes(detail) ?? false

                return (
                  <Pressable
                    key={detail}
                    onPress={() =>
                      onToggleDetail(index, routinePart.part, detail)
                    }
                    className={`min-h-[34px] items-center justify-center rounded-full border px-yb-3 ${
                      active
                        ? "border-yb-accent bg-yb-accent/15"
                        : "border-yb-border-subtle bg-yb-surface"
                    }`}
                  >
                    <Text
                      className={`text-yb-caption font-semibold ${
                        active ? "text-yb-accent" : "text-yb-fg-secondary"
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
  )
}
