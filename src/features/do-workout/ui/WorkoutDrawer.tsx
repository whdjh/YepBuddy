import { Pressable, Text, View, useColorScheme } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { SymbolView } from "expo-symbols"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  type SharedValue,
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
  const isDark = useColorScheme() === "dark"

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
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark
              ? "rgba(60,55,45,0.95)"
              : "rgba(58,47,36,0.95)",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingTop: 8,
            paddingHorizontal: 16,
            paddingBottom: bottomPadding,
          },
          drawerAnimatedStyle,
        ]}
      >
        {/* 핸들 */}
        <View className="items-center mb-yb-2">
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.25)",
            }}
          />
        </View>

        {/* 타이머 */}
        <View className="flex-row items-center justify-center gap-yb-3 mb-yb-3">
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.1)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <SymbolView
              name="dumbbell.fill"
              size={18}
              tintColor="#E0D6C8"
              style={{ width: 18, height: 18 }}
            />
          </View>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "#FFFFFF",
              letterSpacing: 0.02 * 28,
              fontVariant: ["tabular-nums"],
            }}
          >
            {timerDisplay}
          </Text>

          <RingProgress
            size={32}
            strokeWidth={4}
            progress={0.25}
            trackColor="rgba(255,255,255,0.12)"
            fillColor="rgba(200,173,126,0.6)"
          />
        </View>

        {/* 버튼 */}
        <View style={{ gap: BUTTON_GAP }}>
          <Pressable
            onPress={onTogglePause}
            style={{
              height: BUTTON_HEIGHT,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.15)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#FFFFFF",
              }}
            >
              {isPaused
                ? t("workout.active.resume")
                : t("workout.active.stop")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={{
              height: BUTTON_HEIGHT,
              borderRadius: 12,
              backgroundColor: isDark ? "#D4883A" : "#9B7E56",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: isDark ? "#1C1C1E" : "#FAF7F2",
              }}
            >
              {t("workout.active.endWorkout")}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}
