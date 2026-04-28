import { SymbolView } from "expo-symbols"
import type { ReactNode } from "react"
import { useMemo, useRef } from "react"
import { View, useColorScheme } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { IconButton } from "@/shared/ui/IconButton"

const DRAG_REORDER_THRESHOLD = 72

interface EditableSummaryCardFrameProps {
  children: ReactNode
  isEditing: boolean
  onRemove: () => void
  onDrag: (direction: -1 | 1) => void
}

export function EditableSummaryCardFrame({
  children,
  isEditing,
  onRemove,
  onDrag,
}: EditableSummaryCardFrameProps) {
  const isDark = useColorScheme() === "dark"
  const symbolTintColor = isDark ? "#F8E7D0" : "#5B4126"
  const translateY = useSharedValue(0)
  const dragStepRef = useRef(0)
  const dragGesture = useMemo(
    () =>
      Gesture.Pan()
        .enabled(isEditing)
        .runOnJS(true)
        .onBegin(() => {
          dragStepRef.current = 0
        })
        .onUpdate((event) => {
          translateY.value = event.translationY

          const nextStep =
            event.translationY > DRAG_REORDER_THRESHOLD
              ? 1
              : event.translationY < -DRAG_REORDER_THRESHOLD
                ? -1
                : 0

          if (nextStep !== 0 && nextStep !== dragStepRef.current) {
            dragStepRef.current = nextStep
            onDrag(nextStep)
          }
        })
        .onFinalize(() => {
          dragStepRef.current = 0
          translateY.value = withSpring(0)
        }),
    [isEditing, onDrag, translateY],
  )
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: isEditing ? translateY.value : 0 }],
  }))

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View className="relative" style={animatedStyle}>
        <View pointerEvents={isEditing ? "none" : "auto"}>{children}</View>

        {isEditing && (
          <View className="absolute right-yb-2 top-yb-2 z-10">
            <IconButton
              variant="edit"
              accessibilityLabel="삭제"
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
