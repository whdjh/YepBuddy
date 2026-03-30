import { useEffect, useRef, useState } from "react"
import { Text, View } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { SymbolView } from "expo-symbols"
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { useUnstableNativeVariable } from "nativewind"
import Svg, { Circle } from "react-native-svg"
import { IconBox } from "@/shared/ui/IconBox"
import { Main } from "@/shared/ui/Main"

const COUNTDOWN_FROM = 3
const RING_SIZE = 240
const STROKE_WIDTH = 14
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export function CountdownScreen() {
  const { t } = useTranslation()
  const ringTrack = (useUnstableNativeVariable("--yb-ring-track") as unknown as string) || "#EDE4D6"
  const ringFill = (useUnstableNativeVariable("--yb-ring-fill") as unknown as string) || "#9B7E56"
  const iconTint = (useUnstableNativeVariable("--yb-icon-tint") as unknown as string) || "#9B7E56"

  const [count, setCount] = useState(COUNTDOWN_FROM)
  const countRef = useRef(COUNTDOWN_FROM)

  // 링 프로그레스 애니메이션
  const progress = useSharedValue(1)

  useEffect(() => {
    progress.value = withTiming(0, {
      duration: COUNTDOWN_FROM * 1000,
      easing: Easing.linear,
    })

    const interval = setInterval(() => {
      countRef.current -= 1
      if (countRef.current <= 0) {
        clearInterval(interval)
        router.replace("/workout/active")
      } else {
        setCount(countRef.current)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

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
