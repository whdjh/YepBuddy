import type { ReactNode } from "react"
import { useEffect, useMemo } from "react"
import { View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useTranslation } from "react-i18next"
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { SymbolView } from "@/shared/ui/SymbolView"
import { IconButton } from "@/shared/ui/IconButton"
import type { SummaryCardVisualDirection } from "../model/summaryCardLayout"

const DRAG_REORDER_THRESHOLD_Y = 72
const DRAG_REORDER_THRESHOLD_X = 48

interface EditableSummaryCardFrameProps {
  children: ReactNode
  isEditing: boolean
  onRemove: () => void
  onMove: (direction: SummaryCardVisualDirection, steps: number) => void
}

export function EditableSummaryCardFrame({
  children,
  isEditing,
  onRemove,
  onMove,
}: EditableSummaryCardFrameProps) {
  const { t } = useTranslation()
  const { fg: symbolTintColor } = useCardColors()
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const wiggle = useSharedValue(0)

  useEffect(() => {
    if (!isEditing) {
      cancelAnimation(wiggle)
      wiggle.value = withTiming(0, { duration: 90 })
      translateX.value = withSpring(0)
      translateY.value = withSpring(0)
      return
    }

    wiggle.value = withRepeat(
      withSequence(
        withTiming(-0.7, { duration: 90 }),
        withTiming(0.7, { duration: 90 }),
      ),
      -1,
      true,
    )

    return () => {
      cancelAnimation(wiggle)
    }
  }, [isEditing, translateX, translateY, wiggle])

  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isEditing)
        .runOnJS(true)
        .onUpdate((event) => {
          translateX.value = event.translationX
          translateY.value = event.translationY
        })
        .onFinalize((event) => {
          const absX = Math.abs(event.translationX)
          const absY = Math.abs(event.translationY)

          if (absX > absY && absX >= DRAG_REORDER_THRESHOLD_X) {
            onMove(
              event.translationX > 0 ? "right" : "left",
              Math.floor(absX / DRAG_REORDER_THRESHOLD_X),
            )
          }

          if (absY >= absX && absY >= DRAG_REORDER_THRESHOLD_Y) {
            onMove(
              event.translationY > 0 ? "down" : "up",
              Math.floor(absY / DRAG_REORDER_THRESHOLD_Y),
            )
          }

          translateX.value = withSpring(0)
          translateY.value = withSpring(0)
        }),
    [isEditing, onMove, translateX, translateY],
  )
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: isEditing ? translateX.value : 0 },
      { translateY: isEditing ? translateY.value : 0 },
      { rotate: `${isEditing ? wiggle.value : 0}deg` },
    ],
  }))

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View className="relative" style={animatedStyle}>
        <View pointerEvents={isEditing ? "none" : "auto"}>{children}</View>

        {isEditing && (
          <View className="absolute -right-yb-2 -top-yb-2 z-10">
            <IconButton
              variant="edit"
              accessibilityLabel={t("common.delete")}
              onPress={onRemove}
            >
              <SymbolView
                name="xmark"
                size={15}
                tintColor={symbolTintColor}
              />
            </IconButton>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  )
}
