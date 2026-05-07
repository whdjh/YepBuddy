import { SymbolView } from "expo-symbols"
import type { ReactNode } from "react"
import { useEffect, useMemo, useRef } from "react"
import { View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import { IconButton } from "@/shared/ui/IconButton"

const DRAG_REORDER_THRESHOLD_Y = 72
const DRAG_REORDER_THRESHOLD_X = 48

type DragStep = "none" | "x:-1" | "x:1" | "y:-1" | "y:1"

interface EditableSummaryCardFrameProps {
  children: ReactNode
  isEditing: boolean
  onRemove: () => void
  onDrag: (direction: -1 | 1) => void
  onMoveWithinRow: (direction: -1 | 1) => void
}

export function EditableSummaryCardFrame({
  children,
  isEditing,
  onRemove,
  onDrag,
  onMoveWithinRow,
}: EditableSummaryCardFrameProps) {
  const { t } = useTranslation()
  const symbolTintColor =
    (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const wiggle = useSharedValue(0)
  const dragStepRef = useRef<DragStep>("none")

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
        .onBegin(() => {
          dragStepRef.current = "none"
        })
        .onUpdate((event) => {
          translateX.value = event.translationX
          translateY.value = event.translationY

          const absX = Math.abs(event.translationX)
          const absY = Math.abs(event.translationY)
          const nextStep: DragStep =
            absX > DRAG_REORDER_THRESHOLD_X && absX > absY
              ? event.translationX > 0
                ? "x:1"
                : "x:-1"
              : absY > DRAG_REORDER_THRESHOLD_Y
                ? event.translationY > 0
                  ? "y:1"
                  : "y:-1"
                : "none"

          if (nextStep !== "none" && nextStep !== dragStepRef.current) {
            dragStepRef.current = nextStep

            if (nextStep.startsWith("x:")) {
              onMoveWithinRow(nextStep === "x:1" ? 1 : -1)
              return
            }

            onDrag(nextStep === "y:1" ? 1 : -1)
          }
        })
        .onFinalize(() => {
          dragStepRef.current = "none"
          translateX.value = withSpring(0)
          translateY.value = withSpring(0)
        }),
    [isEditing, onDrag, onMoveWithinRow, translateX, translateY],
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
