import { Pressable, Text, type PressableProps } from "react-native"
import { Chip } from "@/shared/ui/Chip"
import { GlassSurface } from "@/shared/ui/GlassSurface"

interface BodyPartSelectionChipProps extends Omit<PressableProps, "children"> {
  label: string
  selected: boolean
  className?: string
}

interface BodyPartDetailSelectionChipProps
  extends Omit<PressableProps, "children"> {
  label: string
  selected: boolean
  className?: string
}

export function BodyPartSelectionChip({
  label,
  selected,
  accessibilityRole = "button",
  accessibilityState,
  ...rest
}: BodyPartSelectionChipProps) {
  const resolvedAccessibilityState =
    accessibilityState ??
    (accessibilityRole === "checkbox"
      ? { checked: selected }
      : { selected })

  return (
    <Chip
      variant={selected ? "active" : "glass"}
      label={label}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      accessibilityState={resolvedAccessibilityState}
      {...rest}
    />
  )
}

export function BodyPartDetailSelectionChip({
  label,
  selected,
  accessibilityRole = "button",
  accessibilityState,
  className,
  ...rest
}: BodyPartDetailSelectionChipProps) {
  const resolvedAccessibilityState =
    accessibilityState ??
    (accessibilityRole === "checkbox"
      ? { checked: selected }
      : { selected })

  if (selected) {
    return (
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={label}
        accessibilityState={resolvedAccessibilityState}
        className={`rounded-full border border-yb-accent bg-yb-accent px-3 py-1.5 active:opacity-90${className ? ` ${className}` : ""}`}
        {...rest}
      >
        <Text className="text-yb-body-sm font-medium text-yb-on-accent">
          {label}
        </Text>
      </Pressable>
    )
  }

  return (
    <GlassSurface cornerRadius={999} fallbackClassName="bg-yb-surface/70">
      <Pressable
        accessibilityRole={accessibilityRole}
        accessibilityLabel={label}
        accessibilityState={resolvedAccessibilityState}
        className={`rounded-full px-3 py-1.5 active:opacity-80${className ? ` ${className}` : ""}`}
        {...rest}
      >
        <Text className="text-yb-body-sm text-yb-fg-secondary">{label}</Text>
      </Pressable>
    </GlassSurface>
  )
}
