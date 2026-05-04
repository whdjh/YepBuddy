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
          {hasJump && (
            <Pressable
              className={`h-10 w-10 items-center justify-center rounded-yb-icon bg-yb-surface-muted/70${atMin ? " opacity-30" : ""}`}
              onPress={onJumpDown}
              disabled={atMin}
            >
              <Text className="text-[13px] font-bold text-yb-fg-secondary">−{jumpStep}</Text>
            </Pressable>
          )}
          <Pressable
            className={`h-10 w-10 items-center justify-center rounded-yb-icon bg-yb-surface-muted/70${atMin ? " opacity-30" : ""}`}
            onPress={onDecrement}
            disabled={atMin}
          >
            <Text className="text-[20px] font-semibold text-yb-fg">−</Text>
          </Pressable>
          <View className={`grow items-center${hasJump ? " min-w-[80px]" : ""}`}>
            <Text className="text-yb-caption text-yb-fg-secondary">
              {label}
            </Text>
            <Text className="mt-[2px] text-[24px] font-bold text-yb-fg">
              {value}
              <Text className="text-yb-body-sm font-medium text-yb-fg-secondary">{unit}</Text>
            </Text>
          </View>
          <Pressable
            className={`h-10 w-10 items-center justify-center rounded-yb-icon bg-yb-surface-muted/70${atMax ? " opacity-30" : ""}`}
            onPress={onIncrement}
            disabled={atMax}
          >
            <Text className="text-[20px] font-semibold text-yb-fg">+</Text>
          </Pressable>
          {hasJump && (
            <Pressable
              className={`h-10 w-10 items-center justify-center rounded-yb-icon bg-yb-surface-muted/70${atMax ? " opacity-30" : ""}`}
              onPress={onJumpUp}
              disabled={atMax}
            >
              <Text className="text-[13px] font-bold text-yb-fg-secondary">+{jumpStep}</Text>
            </Pressable>
          )}
        </View>
      </GlassSurface>
    )
  }

  return (
    <View
      className={`flex-row items-center justify-between p-[14px] rounded-yb-lg bg-yb-surface border border-yb-border gap-yb-2${hasJump ? " px-yb-5" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {hasJump && (
        <Pressable
          className={`w-[44px] h-[44px] rounded-yb-icon bg-yb-surface-muted items-center justify-center${atMin ? " opacity-30" : ""}`}
          onPress={onJumpDown}
          disabled={atMin}
        >
          <Text className="text-[13px] font-bold text-yb-fg-secondary">−{jumpStep}</Text>
        </Pressable>
      )}
      <Pressable
        className={`w-[44px] h-[44px] rounded-yb-icon bg-yb-surface-muted items-center justify-center${atMin ? " opacity-30" : ""}`}
        onPress={onDecrement}
        disabled={atMin}
      >
        <Text className="text-[20px] font-semibold text-yb-fg">−</Text>
      </Pressable>
      <View className={`grow items-center${hasJump ? " min-w-[80px]" : ""}`}>
        <Text className="text-yb-caption text-yb-fg-secondary">{label}</Text>
        <Text className="text-[24px] font-bold text-yb-fg mt-[2px]">
          {value}
          <Text className="text-yb-body-sm font-medium text-yb-fg-secondary">{unit}</Text>
        </Text>
      </View>
      <Pressable
        className={`w-[44px] h-[44px] rounded-yb-icon bg-yb-surface-muted items-center justify-center${atMax ? " opacity-30" : ""}`}
        onPress={onIncrement}
        disabled={atMax}
      >
        <Text className="text-[20px] font-semibold text-yb-fg">+</Text>
      </Pressable>
      {hasJump && (
        <Pressable
          className={`w-[44px] h-[44px] rounded-yb-icon bg-yb-surface-muted items-center justify-center${atMax ? " opacity-30" : ""}`}
          onPress={onJumpUp}
          disabled={atMax}
        >
          <Text className="text-[13px] font-bold text-yb-fg-secondary">+{jumpStep}</Text>
        </Pressable>
      )}
    </View>
  )
}
