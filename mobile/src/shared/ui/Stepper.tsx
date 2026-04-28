import { Pressable, Text, View, useColorScheme, type ViewProps } from "react-native"
import { Host, HStack, VStack, Button as SwiftButton, Text as SwiftText } from "@expo/ui/swift-ui"
import {
  buttonStyle,
  disabled as disabledMod,
  glassEffect,
  padding,
  frame,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers"

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
  const isDark = useColorScheme() === "dark"

  if (variant === "glass") {
    return (
      <Host style={{ height: 64 }}>
        <HStack modifiers={[
          padding({ horizontal: 16, vertical: 12 }),
          glassEffect({ glass: { variant: "regular" }, shape: "roundedRectangle", cornerRadius: 16 }),
        ]}>
          <SwiftButton
            label="−"
            onPress={onDecrement}
            modifiers={[
              buttonStyle("glass"),
              disabledMod(atMin),
            ]}
          />
          <VStack modifiers={[frame({ maxWidth: 9999 })]}>
            <SwiftText modifiers={[foregroundStyle(isDark ? "#A8A29E" : "#876B45")]}>
              {label}
            </SwiftText>
            <SwiftText modifiers={[foregroundStyle(isDark ? "#FFFFFF" : "#3A2A1A")]}>
              {`${value}${unit}`}
            </SwiftText>
          </VStack>
          <SwiftButton
            label="+"
            onPress={onIncrement}
            modifiers={[
              buttonStyle("glass"),
              disabledMod(atMax),
            ]}
          />
        </HStack>
      </Host>
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
