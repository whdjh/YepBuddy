import { Pressable, Text, View } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { SymbolView } from "expo-symbols"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import { RingProgress } from "@/shared/ui/RingProgress"

// 버튼 영역 높이 (버튼 44 × 2 + gap 8)
const BUTTON_HEIGHT = 44
const BUTTON_GAP = 8
export const BUTTONS_HEIGHT = BUTTON_HEIGHT * 2 + BUTTON_GAP

const SPRING_CONFIG = { damping: 20, stiffness: 200 }

interface WorkoutDrawerProps {
  timerDisplay: string
  isPaused: boolean
  onTogglePause: () => void
  bottomPadding: number
}

export function WorkoutDrawer({
  timerDisplay,
  isPaused,
  onTogglePause,
  bottomPadding,
}: WorkoutDrawerProps) {
  const { t } = useTranslation()

  const isDrawerOpen = useSharedValue(true)
  const translateY = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const base = isDrawerOpen.value ? 0 : BUTTONS_HEIGHT
      translateY.value = Math.min(
        BUTTONS_HEIGHT,
        Math.max(0, base + e.translationY),
      )
    })
    .onEnd((e) => {
      if (e.velocityY < -200 || (e.velocityY >= -200 && e.velocityY <= 200 && translateY.value < BUTTONS_HEIGHT / 2)) {
        translateY.value = withSpring(0, SPRING_CONFIG)
        isDrawerOpen.value = true
      } else {
        translateY.value = withSpring(BUTTONS_HEIGHT, SPRING_CONFIG)
        isDrawerOpen.value = false
      }
    })

  const drawerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className="absolute bottom-0 left-0 right-0 bg-yb-drawer-bg rounded-t-yb-xl pt-yb-2 px-yb-4"
        style={[{ paddingBottom: bottomPadding }, drawerAnimatedStyle]}
      >
        {/* 핸들 */}
        <View className="items-center mb-yb-2">
          <View className="w-yb-9 h-[4px] rounded-[2px] bg-yb-drawer-handle" />
        </View>

        {/* 타이머 */}
        <View className="flex-row items-center justify-center gap-yb-3 mb-yb-3">
          <View className="w-yb-9 h-yb-9 rounded-yb-md bg-[var(--yb-icon-bg)] items-center justify-center">
            <SymbolView
              name="dumbbell.fill"
              size={18}
              tintColor="var(--yb-icon-tint)"
            />
          </View>

          <Text
            className="text-yb-num-28 text-yb-drawer-fg tracking-yb-wide"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {timerDisplay}
          </Text>

          <RingProgress
            size={32}
            strokeWidth={4}
            progress={0.25}
            trackColor="var(--yb-drawer-ring-track)"
            fillColor="var(--yb-drawer-ring-fill)"
          />
        </View>

        {/* 버튼 */}
        <View className="gap-yb-2">
          <Pressable
            onPress={onTogglePause}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon border-yb-input border-yb-drawer-border"
          >
            <Text className="text-yb-body-sm font-semibold text-yb-drawer-fg">
              {isPaused
                ? t("workout.active.resume")
                : t("workout.active.stop")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon bg-yb-accent"
          >
            <Text className="text-yb-body-sm font-bold text-yb-on-accent">
              {t("workout.active.endWorkout")}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}
