import { Pressable, Text, View, type ViewProps } from "react-native"

interface SegmentToggleProps extends Omit<ViewProps, "children"> {
  segments: string[]
  activeIndex: number
  onChangeIndex?: (index: number) => void
}

export function SegmentToggle({
  segments,
  activeIndex,
  onChangeIndex,
  className,
  ...rest
}: SegmentToggleProps) {
  return (
    <View
      className={`flex-row bg-yb-surface-muted rounded-yb-icon p-yb-1${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {segments.map((label, i) => {
        const isActive = i === activeIndex
        return (
          <Pressable
            key={i}
            className={`grow h-yb-btn-sm rounded-yb-md items-center justify-center${isActive ? " bg-yb-surface shadow-sm" : ""}`}
            onPress={() => onChangeIndex?.(i)}
          >
            <Text
              className={`text-yb-body-md font-semibold${isActive ? " text-yb-fg" : " text-yb-fg-tertiary"}`}
            >
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
