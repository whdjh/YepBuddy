import { useEffect, useRef, useState } from "react"
import {
  Easing,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

/** 카운트다운 숫자와 링 애니메이션 진행값을 함께 관리 */
export function useCountdown(from: number, onComplete: () => void) {
  const [count, setCount] = useState(from)  // 화면에 보여줄 숫자
  const countRef = useRef(from) // 타이머 계산용
  const progress = useSharedValue(1)  // 애니메이션용 값 저장소

  useEffect(() => {
    if (from <= 0) {
      progress.value = 0
      onComplete()
      return
    }

    countRef.current = from
    setCount(from)

    // 값을 일정 시간 동안 부드럽게 바꾸는 애니메이션
    progress.value = withTiming(0, {
      duration: from * 1000,
      easing: Easing.linear,
    })

    const interval = setInterval(() => {
      countRef.current -= 1
      if (countRef.current <= 0) {
        clearInterval(interval)
        onComplete()
        return
      }

      setCount(countRef.current)
    }, 1000)

    return () => clearInterval(interval)
  }, [from, onComplete, progress])

  return { count, progress }
}
