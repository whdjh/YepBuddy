import type { PressableProps } from "react-native"
import { Chip } from "@/shared/ui/Chip"

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
  className,
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
      className={`min-w-[80px] px-yb-3${selected ? "" : " active:scale-[0.97]"}${className ? ` ${className}` : ""}`}
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

  return (
    <Chip
      variant={selected ? "active" : "glass"}
      label={label}
      className={`min-w-[64px] px-yb-2 ${
        selected ? "active:opacity-90" : "active:opacity-80"
      }${className ? ` ${className}` : ""}`}
      labelClassName={
        selected
          ? "text-yb-body-sm font-medium text-yb-on-accent"
          : "text-yb-body-sm text-yb-fg-secondary"
      }
      fallbackClassName="bg-yb-surface/70"
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      accessibilityState={resolvedAccessibilityState}
      {...rest}
    />
  )
}
