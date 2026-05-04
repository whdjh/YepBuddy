import { Pressable, Text, type PressableProps } from "react-native"
import { GlassSurface } from "./GlassSurface"

type ChipVariant = "default" | "active" | "glass"
type FilterPillVariant = "default" | "active"
type BodyPartPillVariant = "default" | "active"

interface ChipProps extends Omit<PressableProps, "children"> {
  variant?: ChipVariant
  label: string
}

interface FilterPillProps extends Omit<PressableProps, "children"> {
  variant?: FilterPillVariant
  label: string
}

interface BodyPartPillProps {
  variant?: BodyPartPillVariant
  label: string
  onPress?: () => void
}

/* Chip */

const chipContainer: Record<ChipVariant, string> = {
  default:
    "h-yb-chip rounded-yb-chip border border-yb-border bg-yb-fill-pale px-yb-6 items-center justify-center",
  active:
    "h-yb-chip rounded-yb-chip border border-yb-accent bg-yb-accent px-yb-6 items-center justify-center",
  glass:
    "h-yb-chip rounded-yb-chip px-yb-6 items-center justify-center overflow-hidden active:scale-[0.97]",
}

const chipLabel: Record<ChipVariant, string> = {
  default: "text-yb-fg text-yb-body-sm font-medium",
  active:  "text-yb-on-accent text-yb-body-sm font-medium",
  glass:   "text-yb-fg text-yb-body-sm font-medium",
}

export function Chip({ variant = "default", label, ...rest }: ChipProps) {
  if (variant === "glass") {
    return (
      <GlassSurface className="h-yb-chip" cornerRadius={22}>
        <Pressable
          className="h-yb-chip items-center justify-center px-yb-6 active:scale-[0.97]"
          {...rest}
        >
          <Text className={chipLabel.glass}>{label}</Text>
        </Pressable>
      </GlassSurface>
    )
  }

  return (
    <Pressable className={chipContainer[variant]} {...rest}>
      <Text className={chipLabel[variant]}>{label}</Text>
    </Pressable>
  )
}

/* FilterPill */

const filterPillContainer: Record<FilterPillVariant, string> = {
  default:
    "h-[40px] rounded-yb-chip bg-yb-fill-pale px-yb-5 items-center justify-center",
  active:
    "h-[40px] rounded-yb-chip bg-yb-accent px-yb-5 items-center justify-center",
}

const filterPillLabel: Record<FilterPillVariant, string> = {
  default: "text-yb-fg-secondary text-yb-body-sm font-semibold",
  active:  "text-yb-on-accent text-yb-body-sm font-semibold",
}

export function FilterPill({ variant = "default", label, ...rest }: FilterPillProps) {
  return (
    <Pressable className={filterPillContainer[variant]} {...rest}>
      <Text className={filterPillLabel[variant]}>{label}</Text>
    </Pressable>
  )
}

/* BodyPartPill */

export function BodyPartPill({ variant = "default", label, onPress }: BodyPartPillProps) {
  const isActive = variant === "active"

  return (
    <GlassSurface
      className="h-yb-chip"
      cornerRadius={22}
      fallbackClassName={isActive ? "bg-yb-accent/15" : "bg-yb-surface/70"}
    >
      <Pressable
        className="h-yb-chip items-center justify-center px-yb-5 active:scale-[0.97]"
        onPress={onPress}
      >
        <Text
          className={`text-yb-body-sm font-semibold ${
            isActive ? "text-yb-accent" : "text-yb-fg-secondary"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    </GlassSurface>
  )
}
