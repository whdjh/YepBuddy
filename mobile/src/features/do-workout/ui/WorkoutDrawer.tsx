import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { SymbolView } from "expo-symbols"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import { useUnstableNativeVariable } from "nativewind"
import type { BodyPart } from "@/entities/workout-session"
import { BodyPartIcon } from "@/shared/ui/BodyPartIcon"
import {
  canEndWorkoutFromDrawer,
  getWorkoutDrawerExpandedToggleLabelKey,
  getWorkoutDrawerTimerControl,
} from "../lib/workoutDrawerControls"

// 버튼 영역 높이 (버튼 44 × 4 + gap 12)
const BUTTON_HEIGHT = 44
const BUTTON_GAP = 12
const BUTTON_COUNT = 4
export const BUTTONS_HEIGHT =
  BUTTON_HEIGHT * BUTTON_COUNT + BUTTON_GAP * (BUTTON_COUNT - 1)
export const DRAWER_VISIBLE_HEIGHT = 96

const SPRING_CONFIG = { damping: 20, stiffness: 200 }

interface WorkoutDrawerProps {
  timerDisplay: string
  isPaused: boolean
  representativeBodyPart?: BodyPart | null
  onTempo: () => void
  onTogglePause: () => void
  onEnd: () => void
  onDiscard: () => void
  bottomPadding: number
}

export function WorkoutDrawer({
  timerDisplay,
  isPaused,
  representativeBodyPart,
  onTempo,
  onTogglePause,
  onEnd,
  onDiscard,
  bottomPadding,
}: WorkoutDrawerProps) {
  const { t } = useTranslation()
  const dangerColor =
    (useUnstableNativeVariable("--yb-status-error") as unknown as string) ||
    "#E5484D"
  const accentColor =
    (useUnstableNativeVariable("--yb-accent") as unknown as string) ||
    "#9B7E56"
  const onDangerColor =
    (useUnstableNativeVariable("--yb-on-accent") as unknown as string) ||
    "#FFFFFF"

  const collapseHeight = BUTTONS_HEIGHT + bottomPadding
  const isDrawerOpen = useSharedValue(false)
  const translateY = useSharedValue(collapseHeight)
  const timerControl = getWorkoutDrawerTimerControl(isPaused)
  const canEndWorkout = canEndWorkoutFromDrawer(isPaused)

  const openDrawer = () => {
    translateY.value = withSpring(0, SPRING_CONFIG)
    isDrawerOpen.value = true
  }

  const handleTimerControlPress = () => {
    onTogglePause()

    if (!isPaused) {
      openDrawer()
    }
  }

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const base = isDrawerOpen.value ? 0 : collapseHeight
      translateY.value = Math.min(
        collapseHeight,
        Math.max(0, base + e.translationY),
      )
    })
    .onEnd((e) => {
      if (e.velocityY < -200 || (e.velocityY >= -200 && e.velocityY <= 200 && translateY.value < collapseHeight / 2)) {
        translateY.value = withSpring(0, SPRING_CONFIG)
        isDrawerOpen.value = true
      } else {
        translateY.value = withSpring(collapseHeight, SPRING_CONFIG)
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
          <BodyPartIcon bodyPart={representativeBodyPart} size="drawer" />

          <Text
            className="text-yb-num-28 text-yb-drawer-fg tracking-yb-wide"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {timerDisplay}
          </Text>

          <Pressable
            onPress={handleTimerControlPress}
            accessibilityLabel={t(timerControl.labelKey)}
            className="items-center justify-center rounded-full"
            style={{
              backgroundColor: isPaused ? accentColor : dangerColor,
              height: 48,
              width: 48,
            }}
          >
            <SymbolView
              name={timerControl.iconName}
              size={20}
              tintColor={onDangerColor}
            />
          </Pressable>
        </View>

        {/* 버튼 */}
        <View className="gap-yb-3">
          <Pressable
            onPress={onTempo}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon border-yb-input border-yb-drawer-border"
          >
            <Text className="text-yb-body-sm font-semibold text-yb-drawer-fg">
              {t("tabs.tempo")}
            </Text>
          </Pressable>

          <Pressable
            onPress={onTogglePause}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon border-yb-input border-yb-drawer-border"
          >
            <Text className="text-yb-body-sm font-semibold text-yb-drawer-fg">
              {t(getWorkoutDrawerExpandedToggleLabelKey(isPaused))}
            </Text>
          </Pressable>

          <Pressable
            onPress={onEnd}
            disabled={!canEndWorkout}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon bg-yb-accent"
          >
            <Text className="text-yb-body-sm font-bold text-yb-on-accent">
              {t("workout.active.endWorkout")}
            </Text>
          </Pressable>

          <Pressable
            onPress={onDiscard}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon bg-yb-drawer-danger-bg"
          >
            <Text className="text-yb-body-sm font-bold text-yb-drawer-danger-fg">
              {t("workout.active.discardWorkout")}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}
