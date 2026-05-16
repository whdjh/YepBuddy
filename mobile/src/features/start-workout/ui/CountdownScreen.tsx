import { useCallback, useEffect } from "react"
import { Text, View } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import Animated, {
  useAnimatedProps,
} from "react-native-reanimated"
import Svg, { Circle } from "react-native-svg"
import {
  cancelScheduledWorkoutReminder,
  getWorkoutLocationOnce,
  useWorkout,
} from "@/entities/workout-session"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SymbolView } from "@/shared/ui/SymbolView"
import { IconBox } from "@/shared/ui/IconBox"
import { Main } from "@/shared/ui/Main"
import { useCountdown } from "../lib/useCountdown"

const COUNTDOWN_FROM = 3
const RING_SIZE = 240
const STROKE_WIDTH = 14
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export function CountdownScreen() {
  const { t } = useTranslation()
  const { setLocation, startCountdown, startRecording } = useWorkout()
  const ringTrack = useResolvedColorToken(semanticColorTokens.ringTrack)
  const ringFill = useResolvedColorToken(semanticColorTokens.ringFill)
  const iconTint = useResolvedColorToken(semanticColorTokens.iconTint)

  const handleComplete = useCallback(() => {
    startRecording()
    router.replace("/workout/active")
  }, [startRecording])

  const { count, progress } = useCountdown(COUNTDOWN_FROM, handleComplete)

  useEffect(() => {
    startCountdown()
  }, [startCountdown])

  useEffect(() => {
    void cancelScheduledWorkoutReminder()
  }, [])

  useEffect(() => {
    void getWorkoutLocationOnce()
      .then((location) => {
        setLocation(location)
      })
      .catch(() => {
        setLocation(null)
      })
  }, [setLocation])

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }))

  return (
    <Main className="workout-mode items-center justify-center">
      {/* 덤벨 아이콘 */}
      <IconBox size="md" className="bg-[var(--yb-icon-bg)]">
        <SymbolView
          name="dumbbell.fill"
          size={24}
          tintColor={iconTint}
        />
      </IconBox>

      {/* 링 프로그레스 + 카운트다운 숫자 */}
      <View className="mt-yb-10 items-center justify-center w-[240px] h-[240px]">
        <Svg width={RING_SIZE} height={RING_SIZE} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ringTrack}
            strokeWidth={STROKE_WIDTH}
          />
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={ringFill}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </Svg>
        <Text className="absolute text-yb-num-2xl text-yb-fg">
          {count}
        </Text>
      </View>

      {/* 라벨 */}
      <Text className="mt-yb-8 text-yb-title text-yb-label-secondary">
        {t("workout.countdown.label")}
      </Text>
    </Main>
  )
}
