import { Pressable, Text, type PressableProps } from "react-native"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { GlassSurface } from "./GlassSurface"

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
  danger:  "text-yb-on-danger text-yb-body-lg font-semibold",
}

export function Button({ variant = "primary", label, className, disabled, onPress, ...rest }: ButtonProps) {
  const { fgSecondary } = useCardColors()

  if (variant === "glass") {
    return (
      <GlassSurface
        className={`${disabled ? "opacity-40" : ""} ${className ?? ""}`}
        cornerRadius={14}
        minHeight={52}
        paddingSize={0}
      >
        <Pressable
          className="h-yb-btn-md items-center justify-center px-yb-6 active:opacity-80"
          disabled={disabled}
          onPress={onPress}
          {...rest}
        >
          <Text
            className="text-yb-body-lg font-bold"
            style={{ color: fgSecondary }}
          >
            {label}
          </Text>
        </Pressable>
      </GlassSurface>
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
