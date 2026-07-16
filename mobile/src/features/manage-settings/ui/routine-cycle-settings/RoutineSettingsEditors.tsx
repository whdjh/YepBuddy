import { cssInterop } from "nativewind"
import { Platform, ScrollView, Text, View } from "react-native"
import { Pressable as GesturePressable } from "react-native-gesture-handler"
import {
  BODY_PART_DETAILS,
  BodyPartDetailSelectionChip,
  BodyPartSelectionChip,
  type BodyPart,
  type BodyPartDetail,
  type RoutineCycleSession,
} from "@/entities/workout-session"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"
import { GlassSurface } from "@/shared/ui/GlassSurface"

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
  max?: number
  disabled?: boolean
  onChange: (value: number) => void
}

interface RoutineSessionPartEditorProps {
  index: number
  session: RoutineCycleSession
  onTogglePart: (index: number, part: BodyPart) => void
  onToggleDetail: (
    index: number,
    part: BodyPart,
    detail: BodyPartDetail,
  ) => void
  disabled?: boolean
}

interface RoutineSettingsSaveButtonProps {
  label: string
  disabled?: boolean
  onPress: () => void
}

export function CycleStepper({
  label,
  value,
  min,
  max,
  disabled = false,
  onChange,
}: CycleStepperProps) {
  const decrementDisabled = disabled || value <= min
  const incrementDisabled = disabled || (max != null && value >= max)

  return (
    <GlassSurface
      className={`shadow-yb-sm${disabled ? " opacity-60" : ""}`}
      cornerRadius={16}
      fallbackClassName="bg-yb-glass-bg"
    >
      <View className="flex-row items-center justify-between px-yb-4 py-yb-2.5">
        <Text className="text-yb-body-sm font-semibold text-yb-fg">
          {label}
        </Text>
        <View className="flex-row items-center rounded-full bg-yb-surface-muted p-yb-0.5">
          <Pressable
            disabled={decrementDisabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: decrementDisabled }}
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
            disabled={incrementDisabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: incrementDisabled }}
            className={`h-yb-8 w-yb-8 items-center justify-center rounded-full ${
              incrementDisabled
                ? "bg-yb-surface/50"
                : "bg-yb-surface shadow-yb-sm active:opacity-80"
            }`}
            onPress={() =>
              onChange(max == null ? value + 1 : Math.min(max, value + 1))
            }
          >
            <Text
              className={`text-yb-body-md font-semibold ${
                incrementDisabled ? "text-yb-fg-tertiary" : "text-yb-accent"
              }`}
            >
              +
            </Text>
          </Pressable>
        </View>
      </View>
    </GlassSurface>
  )
}

export function RoutineSettingsSaveButton({
  label,
  disabled = false,
  onPress,
}: RoutineSettingsSaveButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`${Platform.OS === "android" ? "mb-yb-3" : "mb-yb-10"} mt-yb-3 h-yb-btn-md items-center justify-center rounded-full px-yb-6 shadow-yb-md ${
        disabled
          ? "bg-yb-accent/50"
          : "bg-yb-accent active:opacity-90"
      }`}
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
  disabled = false,
}: RoutineSessionPartEditorProps) {
  return (
    <GlassSurface
      className={`shadow-yb-sm${disabled ? " opacity-60" : ""}`}
      cornerRadius={16}
      fallbackClassName="bg-yb-glass-bg"
    >
      <View className="px-yb-3.5 py-yb-3.5">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-[10px] pl-1 pr-yb-1"
        >
          {ALL_BODY_PARTS.map((part) => {
            const active = session.parts.some((item) => item.part === part)
            const label = bodyPartLabel(part)

            return (
              <BodyPartSelectionChip
                key={part}
                label={label}
                selected={active}
                disabled={disabled}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: active, disabled }}
                onPress={() => {
                  if (!disabled) {
                    onTogglePart(index, part)
                  }
                }}
              />
            )
          })}
        </ScrollView>
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
                  const label = bodyPartDetailLabel(detail)

                  return (
                    <BodyPartDetailSelectionChip
                      key={detail}
                      label={label}
                      selected={active}
                      disabled={disabled}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active, disabled }}
                      onPress={() =>
                        !disabled &&
                        onToggleDetail(index, routinePart.part, detail)
                      }
                    />
                  )
                })}
              </View>
            </View>
          )
        })}
      </View>
    </GlassSurface>
  )
}
