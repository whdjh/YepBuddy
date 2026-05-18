import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import type { WorkoutState } from "@/entities/workout-session"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SymbolView } from "@/shared/ui/SymbolView"
import { useWorkoutTimer } from "../lib/useWorkoutTimer"
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
  workoutState: WorkoutState
  isPaused: boolean
  hasCardioStarted: boolean
  onStartCardio: () => void
  onTempo: () => void
  onTogglePause: () => void
  onEnd: () => void
  onDiscard: () => void
  bottomPadding: number
}

function WorkoutTimerText({ state }: { state: WorkoutState }) {
  const { timerDisplay } = useWorkoutTimer(state)

  return (
    <Text
      className="text-yb-num-28 text-yb-drawer-fg tracking-yb-wide"
      style={{ fontVariant: ["tabular-nums"] }}
    >
      {timerDisplay}
    </Text>
  )
}

export function WorkoutDrawer({
  workoutState,
  isPaused,
  hasCardioStarted,
  onStartCardio,
  onTempo,
  onTogglePause,
  onEnd,
  onDiscard,
  bottomPadding,
}: WorkoutDrawerProps) {
  const { t } = useTranslation()
  const dangerColor = useResolvedColorToken(semanticColorTokens.statusError)
  const accentColor = useResolvedColorToken(semanticColorTokens.accent)
  const cardioColor = useResolvedColorToken(semanticColorTokens.statusSuccess)
  const onDangerColor = useResolvedColorToken(semanticColorTokens.onAccent)

  const collapseHeight = BUTTONS_HEIGHT + bottomPadding
  const isDrawerOpen = useSharedValue(false)
  const translateY = useSharedValue(collapseHeight)
  const timerControl = getWorkoutDrawerTimerControl(isPaused)
  const canEndWorkout = canEndWorkoutFromDrawer(isPaused)
  const canStartCardio = !isPaused && !hasCardioStarted

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
          <Pressable
            onPress={onStartCardio}
            disabled={!canStartCardio}
            accessibilityRole="button"
            accessibilityLabel={t("workout.calendar.cardio")}
            accessibilityState={{ disabled: !canStartCardio }}
            className="items-center justify-center rounded-yb-icon"
            style={{
              backgroundColor: hasCardioStarted
                ? cardioColor
                : "rgba(255,255,255,0.08)",
              borderColor: hasCardioStarted
                ? cardioColor
                : "rgba(255,255,255,0.18)",
              borderWidth: 1,
              height: 48,
              opacity: isPaused && !hasCardioStarted ? 0.55 : 1,
              width: 48,
            }}
          >
            <SymbolView
              name="figure.run"
              size={22}
              tintColor={hasCardioStarted ? onDangerColor : cardioColor}
            />
          </Pressable>

          <WorkoutTimerText state={workoutState} />

          <Pressable
            onPress={handleTimerControlPress}
            accessibilityRole="button"
            accessibilityLabel={t(timerControl.labelKey)}
            accessibilityState={{ disabled: false }}
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
            accessibilityRole="button"
            accessibilityLabel={t("tabs.tempo")}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon border-yb-input border-yb-drawer-border"
          >
            <Text className="text-yb-body-sm font-semibold text-yb-drawer-fg">
              {t("tabs.tempo")}
            </Text>
          </Pressable>

          <Pressable
            onPress={onTogglePause}
            accessibilityRole="button"
            accessibilityLabel={t(getWorkoutDrawerExpandedToggleLabelKey(isPaused))}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon border-yb-input border-yb-drawer-border"
          >
            <Text className="text-yb-body-sm font-semibold text-yb-drawer-fg">
              {t(getWorkoutDrawerExpandedToggleLabelKey(isPaused))}
            </Text>
          </Pressable>

          <Pressable
            onPress={onEnd}
            disabled={!canEndWorkout}
            accessibilityRole="button"
            accessibilityLabel={t("workout.active.endWorkout")}
            accessibilityState={{ disabled: !canEndWorkout }}
            className="h-yb-btn-sm items-center justify-center rounded-yb-icon bg-yb-accent"
          >
            <Text className="text-yb-body-sm font-bold text-yb-on-accent">
              {t("workout.active.endWorkout")}
            </Text>
          </Pressable>

          <Pressable
            onPress={onDiscard}
            accessibilityRole="button"
            accessibilityLabel={t("workout.active.discardWorkout")}
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
