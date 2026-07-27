import { Pressable, Text, type PressableProps } from "react-native"
import { GlassBackground } from "./GlassBackground"

type ChipVariant = "default" | "active" | "glass"
type FilterPillVariant = "default" | "active" | "glass"

interface ChipProps extends Omit<PressableProps, "children"> {
  variant?: ChipVariant
  label: string
  className?: string
  labelClassName?: string
  fallbackClassName?: string
}

interface FilterPillProps extends Omit<PressableProps, "children"> {
  variant?: FilterPillVariant
  label: string
  className?: string
}

/* Chip */

const chipContainer: Record<ChipVariant, string> = {
  default:
    "border border-yb-border bg-yb-fill-pale",
  active:
    "border border-yb-accent bg-yb-accent",
  glass:
    "border border-yb-glass-border",
}

const chipLabel: Record<ChipVariant, string> = {
  default: "text-yb-fg text-yb-body-sm font-medium",
  active:  "text-yb-on-accent text-yb-body-sm font-medium",
  glass:   "text-yb-fg text-yb-body-sm font-medium",
}

export function Chip({
  variant = "default",
  label,
  className,
  labelClassName,
  fallbackClassName,
  ...rest
}: ChipProps) {
  const glass = variant === "glass"

  return (
    <Pressable
      className={`h-yb-chip items-center justify-center overflow-hidden rounded-yb-chip px-yb-6 ${chipContainer[variant]}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {glass ? (
        <GlassBackground
          cornerRadius={22}
          fallbackClassName={fallbackClassName}
        />
      ) : null}
      <Text className={labelClassName ?? chipLabel[variant]}>{label}</Text>
    </Pressable>
  )
}

/* FilterPill */

const filterPillContainer: Record<FilterPillVariant, string> = {
  default:
    "bg-yb-fill-pale",
  active:
    "bg-yb-accent",
  glass:
    "border border-yb-glass-border",
}

const filterPillLabel: Record<FilterPillVariant, string> = {
  default: "text-yb-fg-secondary text-yb-body-sm font-semibold",
  active:  "text-yb-on-accent text-yb-body-sm font-semibold",
  glass:   "text-yb-fg-secondary text-yb-body-sm font-semibold",
}

export function FilterPill({
  variant = "default",
  label,
  className,
  ...rest
}: FilterPillProps) {
  const glass = variant === "glass"

  return (
    <Pressable
      className={`h-yb-10 items-center justify-center overflow-hidden rounded-yb-chip px-yb-5 ${filterPillContainer[variant]}${glass ? " active:scale-[0.97]" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {glass ? <GlassBackground cornerRadius={22} /> : null}
      <Text className={filterPillLabel[variant]}>{label}</Text>
    </Pressable>
  )
}
