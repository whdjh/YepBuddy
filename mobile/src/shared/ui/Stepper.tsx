import { Pressable, Text, View, type ViewProps } from "react-native"
import { GlassSurface } from "./GlassSurface"

type StepperVariant = "default" | "glass"

interface StepperProps extends Omit<ViewProps, "children"> {
  variant?: StepperVariant
  label: string
  value: number
  unit: string
  min?: number
  max?: number
  disabled?: boolean
  onDecrement?: () => void
  onIncrement?: () => void
  jumpStep?: number
  onJumpDown?: () => void
  onJumpUp?: () => void
}

export function Stepper({
  variant = "default",
  label,
  value,
  unit,
  min,
  max,
  disabled = false,
  onDecrement,
  onIncrement,
  jumpStep,
  onJumpDown,
  onJumpUp,
  className,
  ...rest
}: StepperProps) {
  const hasJump = jumpStep != null
  const atMin = min != null && value <= min
  const atMax = max != null && value >= max
  const decrementDisabled = disabled || atMin
  const incrementDisabled = disabled || atMax
  const decrementAccessibilityLabel = `${label}: -1 ${unit}`
  const incrementAccessibilityLabel = `${label}: +1 ${unit}`
  const jumpDownAccessibilityLabel = `${label}: -${jumpStep ?? 0} ${unit}`
  const jumpUpAccessibilityLabel = `${label}: +${jumpStep ?? 0} ${unit}`
  const controlClassName =
    variant === "glass"
      ? "h-yb-icon-btn w-yb-icon-btn items-center justify-center rounded-yb-icon bg-yb-surface-muted/70"
      : "w-yb-icon-btn h-yb-icon-btn rounded-yb-icon bg-yb-surface-muted items-center justify-center"
  const controls = (
    <>
      {hasJump && (
        <Pressable
          accessibilityLabel={jumpDownAccessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: decrementDisabled }}
          className={`${controlClassName}${decrementDisabled ? " opacity-30" : ""}`}
          onPress={onJumpDown}
          disabled={decrementDisabled}
        >
          <Text className="text-yb-label font-bold text-yb-fg-secondary">
            −{jumpStep}
          </Text>
        </Pressable>
      )}
      <Pressable
        accessibilityLabel={decrementAccessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: decrementDisabled }}
        className={`${controlClassName}${decrementDisabled ? " opacity-30" : ""}`}
        onPress={onDecrement}
        disabled={decrementDisabled}
      >
        <Text className="text-yb-heading-sm font-semibold text-yb-fg">−</Text>
      </Pressable>
      <View className={`grow items-center${hasJump ? " min-w-[80px]" : ""}`}>
        <Text className="text-yb-caption text-yb-fg-secondary">{label}</Text>
        <Text className="mt-yb-0.5 text-yb-num-sm font-bold text-yb-fg">
          {value}
          <Text className="text-yb-body-sm font-medium text-yb-fg-secondary">
            {unit}
          </Text>
        </Text>
      </View>
      <Pressable
        accessibilityLabel={incrementAccessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: incrementDisabled }}
        className={`${controlClassName}${incrementDisabled ? " opacity-30" : ""}`}
        onPress={onIncrement}
        disabled={incrementDisabled}
      >
        <Text className="text-yb-heading-sm font-semibold text-yb-fg">+</Text>
      </Pressable>
      {hasJump && (
        <Pressable
          accessibilityLabel={jumpUpAccessibilityLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled: incrementDisabled }}
          className={`${controlClassName}${incrementDisabled ? " opacity-30" : ""}`}
          onPress={onJumpUp}
          disabled={incrementDisabled}
        >
          <Text className="text-yb-label font-bold text-yb-fg-secondary">
            +{jumpStep}
          </Text>
        </Pressable>
      )}
    </>
  )

  if (variant === "glass") {
    return (
      <GlassSurface
        className={className}
        cornerRadius={16}
        minHeight={64}
        paddingSize={0}
        {...rest}
      >
        <View className={`flex-row items-center justify-between gap-yb-2 px-yb-4 py-yb-3${hasJump ? " px-yb-5" : ""}`}>
          {controls}
        </View>
      </GlassSurface>
    )
  }

  return (
    <View
      className={`flex-row items-center justify-between p-yb-3.5 rounded-yb-lg bg-yb-surface border border-yb-border gap-yb-2${hasJump ? " px-yb-5" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {controls}
    </View>
  )
}
