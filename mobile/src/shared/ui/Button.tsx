import { Pressable, Text, useColorScheme, type PressableProps } from "react-native"
import { Host, HStack, Button as SwiftButton } from "@expo/ui/swift-ui"
import {
  buttonStyle,
  disabled as disabledMod,
  glassEffect,
  frame,
  font,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers"

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "danger" | "glass"

interface ButtonProps extends Omit<PressableProps, "children" | "onPress"> {
  variant?: ButtonVariant
  label: string
  className?: string
  onPress?: () => void
}

const containerStyles: Record<Exclude<ButtonVariant, "glass">, string> = {
  primary:
    "h-yb-btn-md rounded-yb-lg bg-yb-fill-strong px-yb-6 items-center justify-center active:opacity-80",
  accent:
    "h-yb-btn-md rounded-yb-lg bg-yb-accent px-yb-6 items-center justify-center active:opacity-80",
  outline:
    "h-yb-btn-md rounded-yb-lg border-yb-input border-yb-accent px-yb-6 items-center justify-center bg-transparent active:opacity-80",
  ghost:
    "h-yb-btn-sm rounded-yb-md px-yb-6 items-center justify-center bg-transparent active:opacity-80",
  danger:
    "h-yb-btn-md rounded-yb-lg bg-yb-status-error px-yb-6 items-center justify-center active:opacity-80",
}

const labelStyles: Record<Exclude<ButtonVariant, "glass">, string> = {
  primary: "text-yb-on-strong text-yb-body-lg font-semibold",
  accent:  "text-yb-on-accent text-yb-body-lg font-semibold",
  outline: "text-yb-accent text-yb-body-lg font-semibold",
  ghost:   "text-yb-fg-secondary text-yb-body-sm font-medium",
  danger:  "text-white text-yb-body-lg font-semibold",
}

export function Button({ variant = "primary", label, className, disabled, onPress, ...rest }: ButtonProps) {
  const isDark = useColorScheme() === "dark"

  if (variant === "glass") {
    // semantic.fg-secondary → dark: cream.200, light: khaki.400
    const fgColor = isDark ? "#EDE4D6" : "#876B45"

    return (
      <Host style={{ height: 52 }}>
        <HStack
          modifiers={[
            frame({ maxWidth: Infinity, height: 52 }),
            glassEffect({ glass: { variant: "regular", interactive: true }, shape: "roundedRectangle", cornerRadius: 14 }),
          ]}
        >
          <SwiftButton
            label={label}
            onPress={onPress}
            modifiers={[
              buttonStyle("plain"),
              font({ weight: "bold", size: 16 }),
              foregroundStyle(fgColor),
              frame({ maxWidth: Infinity }),
              disabledMod(!!disabled),
            ]}
          />
        </HStack>
      </Host>
    )
  }

  return (
    <Pressable
      className={`${containerStyles[variant]} ${disabled ? "opacity-40" : ""} ${className ?? ""}`}
      disabled={disabled}
      onPress={onPress}
      {...rest}
    >
      <Text className={labelStyles[variant]}>{label}</Text>
    </Pressable>
  )
}