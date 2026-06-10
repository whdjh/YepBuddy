import { useEffect } from "react"
import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import type { WorkoutState } from "@/entities/workout-session"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  cancelAnimation,
  withSpring,
  withRepeat,
  withTiming,
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
  const accentColor = useResolvedColorToken(semanticColorTokens.accent)
  const cardioColor = useResolvedColorToken(semanticColorTokens.statusSuccess)
  const onDangerColor = useResolvedColorToken(semanticColorTokens.onAccent)

  const collapseHeight = BUTTONS_HEIGHT + bottomPadding
  const isDrawerOpen = useSharedValue(false)
  const translateY = useSharedValue(collapseHeight)
  const cardioPulseProgress = useSharedValue(0)
  const timerControl = getWorkoutDrawerTimerControl(isPaused)
  const canEndWorkout = canEndWorkoutFromDrawer(isPaused)
  const canStartCardio = !isPaused && !hasCardioStarted
  const cardioButtonBorderColor = hasCardioStarted
    ? cardioColor
    : "rgba(34,197,94,0.45)"
  const cardioButtonBackgroundColor = hasCardioStarted
    ? cardioColor
    : "rgba(255,255,255,0.08)"
  const cardioButtonOpacity = isPaused && !hasCardioStarted ? 0.55 : 1
  const cardioIconColor = hasCardioStarted ? onDangerColor : cardioColor
  const timerControlBackgroundColor =
    timerControl.tone === "neutral" ? "rgba(255,255,255,0.12)" : accentColor

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

  const cardioPulseAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.48 * (1 - cardioPulseProgress.value),
    transform: [{ scale: 0.9 + cardioPulseProgress.value * 0.26 }],
  }))

  useEffect(() => {
    if (hasCardioStarted) {
      cardioPulseProgress.value = 0
      cardioPulseProgress.value = withRepeat(
        withTiming(1, { duration: 1200 }),
        -1,
        false,
      )
    } else {
      cancelAnimation(cardioPulseProgress)
      cardioPulseProgress.value = 0
    }

    return () => {
      cancelAnimation(cardioPulseProgress)
    }
  }, [cardioPulseProgress, hasCardioStarted])

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
            accessibilityState={{
              disabled: !canStartCardio,
              selected: hasCardioStarted,
            }}
            className="items-center justify-center rounded-yb-icon"
            style={{
              backgroundColor: cardioButtonBackgroundColor,
              borderColor: cardioButtonBorderColor,
              borderWidth: 1,
              height: 48,
              opacity: cardioButtonOpacity,
              position: "relative",
              width: 48,
            }}
          >
            {hasCardioStarted ? (
              <Animated.View
                pointerEvents="none"
                className="absolute"
                style={[
                  {
                    borderColor: "rgba(255,255,255,0.44)",
                    borderRadius: 18,
                    borderWidth: 2,
                    height: 56,
                    left: -4,
                    top: -4,
                    width: 56,
                  },
                  cardioPulseAnimatedStyle,
                ]}
              />
            ) : null}
            <SymbolView
              name="figure.run"
              size={22}
              tintColor={cardioIconColor}
            />
            {hasCardioStarted ? (
              <View
                pointerEvents="none"
                className="absolute items-center justify-center rounded-full"
                style={{
                  backgroundColor: onDangerColor,
                  borderColor: "#161b22",
                  borderWidth: 2,
                  height: 16,
                  right: -5,
                  top: -5,
                  width: 16,
                }}
              >
                <SymbolView
                  name="checkmark"
                  size={9}
                  tintColor={cardioColor}
                />
              </View>
            ) : null}
          </Pressable>

          <WorkoutTimerText state={workoutState} />

          <Pressable
            onPress={handleTimerControlPress}
            accessibilityRole="button"
            accessibilityLabel={t(timerControl.labelKey)}
            accessibilityState={{ disabled: false }}
            className="items-center justify-center rounded-full"
            style={{
              backgroundColor: timerControlBackgroundColor,
              height: 48,
              width: 48,
            }}
          >
            <SymbolView
              name={timerControl.iconName}
              size={20}
              tintColor={accentColor}
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
