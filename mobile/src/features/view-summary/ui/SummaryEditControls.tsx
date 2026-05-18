import { useEffect } from "react"
import { Pressable, useColorScheme } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SymbolView } from "@/shared/ui/SymbolView"
import { GlassCircleBackground } from "@/shared/ui/GlassCircleBackground"

interface SummaryEditControlsProps {
  addLabel: string
  doneLabel: string
  topOffset: number
  onAdd: () => void
  onDone: () => void
}

export function SummaryEditControls({
  addLabel,
  doneLabel,
  topOffset,
  onAdd,
  onDone,
}: SummaryEditControlsProps) {
  const isDark = useColorScheme() === "dark"
  const onStrongColor = useResolvedColorToken(semanticColorTokens.onStrong)
  const foregroundColor = useResolvedColorToken(semanticColorTokens.fg)
  const successTextColor = useResolvedColorToken(
    semanticColorTokens.statusSuccessText,
  )
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withSpring(1, { damping: 18, stiffness: 260 })
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * -8 },
      { scale: 0.92 + progress.value * 0.08 },
    ],
  }))

  return (
    <Animated.View
      pointerEvents="box-none"
      className="absolute left-yb-5 right-yb-5 z-20 flex-row items-center justify-between"
      style={[animatedStyle, { top: topOffset }]}
    >
      <Pressable
        accessibilityLabel={addLabel}
        className="h-yb-12 w-yb-12 items-center justify-center rounded-full bg-yb-fill-strong shadow-yb-sm active:scale-95 dark:border dark:border-yb-border dark:bg-yb-surface-subtle"
        onPress={onAdd}
      >
        <SymbolView
          name="plus"
          size={24}
          tintColor={isDark ? foregroundColor : onStrongColor}
        />
      </Pressable>
      <Pressable
        accessibilityLabel={doneLabel}
        className="h-yb-12 w-yb-12 items-center justify-center overflow-hidden rounded-full border border-yb-glass-border bg-yb-glass-bg shadow-yb-sm active:scale-95"
        onPress={onDone}
      >
        <GlassCircleBackground />
        <SymbolView name="checkmark" size={24} tintColor={successTextColor} />
      </Pressable>
    </Animated.View>
  )
}
