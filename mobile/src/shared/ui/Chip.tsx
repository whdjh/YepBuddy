import { Pressable, Text, type PressableProps } from "react-native"
import { GlassSurface } from "./GlassSurface"

type ChipVariant = "default" | "active" | "glass"
type FilterPillVariant = "default" | "active" | "glass"
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

/* GlassPill — 공통 글래스 알약 프리미티브 */

interface GlassPillProps extends Omit<PressableProps, "children"> {
  label: string
  heightClass: string
  paddingClass: string
  labelClass: string
  fallbackClassName?: string
}

function GlassPill({
  label,
  heightClass,
  paddingClass,
  labelClass,
  fallbackClassName,
  ...rest
}: GlassPillProps) {
  return (
    <GlassSurface
      className={heightClass}
      cornerRadius={22}
      fallbackClassName={fallbackClassName}
    >
      <Pressable
        className={`${heightClass} ${paddingClass} items-center justify-center active:scale-[0.97]`}
        {...rest}
      >
        <Text className={labelClass}>{label}</Text>
      </Pressable>
    </GlassSurface>
  )
}

/* Chip */

const chipContainer: Record<Exclude<ChipVariant, "glass">, string> = {
  default:
    "h-yb-chip rounded-yb-chip border border-yb-border bg-yb-fill-pale px-yb-6 items-center justify-center",
  active:
    "h-yb-chip rounded-yb-chip border border-yb-accent bg-yb-accent px-yb-6 items-center justify-center",
}

const chipLabel: Record<ChipVariant, string> = {
  default: "text-yb-fg text-yb-body-sm font-medium",
  active:  "text-yb-on-accent text-yb-body-sm font-medium",
  glass:   "text-yb-fg text-yb-body-sm font-medium",
}

export function Chip({ variant = "default", label, ...rest }: ChipProps) {
  if (variant === "glass") {
    return (
      <GlassPill
        label={label}
        heightClass="h-yb-chip"
        paddingClass="px-yb-6"
        labelClass={chipLabel.glass}
        {...rest}
      />
    )
  }

  return (
    <Pressable className={chipContainer[variant]} {...rest}>
      <Text className={chipLabel[variant]}>{label}</Text>
    </Pressable>
  )
}

/* FilterPill */

const filterPillContainer: Record<Exclude<FilterPillVariant, "glass">, string> = {
  default:
    "h-yb-10 rounded-yb-chip bg-yb-fill-pale px-yb-5 items-center justify-center",
  active:
    "h-yb-10 rounded-yb-chip bg-yb-accent px-yb-5 items-center justify-center",
}

const filterPillLabel: Record<FilterPillVariant, string> = {
  default: "text-yb-fg-secondary text-yb-body-sm font-semibold",
  active:  "text-yb-on-accent text-yb-body-sm font-semibold",
  glass:   "text-yb-fg-secondary text-yb-body-sm font-semibold",
}

export function FilterPill({ variant = "default", label, ...rest }: FilterPillProps) {
  if (variant === "glass") {
    return (
      <GlassPill
        label={label}
        heightClass="h-yb-10"
        paddingClass="px-yb-5"
        labelClass={filterPillLabel.glass}
        {...rest}
      />
    )
  }

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
    <GlassPill
      label={label}
      heightClass="h-yb-chip"
      paddingClass="px-yb-5"
      labelClass={`text-yb-body-sm font-semibold ${
        isActive ? "text-yb-accent" : "text-yb-fg-secondary"
      }`}
      fallbackClassName={isActive ? "bg-yb-accent/15" : "bg-yb-surface/70"}
      onPress={onPress}
    />
  )
}
