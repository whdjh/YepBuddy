import { useEffect, useMemo, useState } from "react"
import type { WorkoutState } from "@/entities/workout-session"
import { formatElapsedMs } from "@/shared/lib/format"
import { calculateWorkoutElapsedMs } from "./calculateWorkoutElapsedMs"

export function useWorkoutTimer(state: WorkoutState) {
  const [nowMs, setNowMs] = useState(Date.now())

  useEffect(() => {
    // 실제 기록 중일 때만 ticking
    if (state.phase !== "recording") {
      return
    }

    const interval = setInterval(() => {
      // 현재 시각을 갱신해 elapsed time을 다시 계산
      setNowMs(Date.now())
    }, 50)

    return () => clearInterval(interval)
  }, [state.phase])

  useEffect(() => {
    if (state.phase === "paused") {
      // paused 진입 시점에 한 번만 갱신해 화면 타이머를 고정
      setNowMs(Date.now())
    }
  }, [state.phase])

  return useMemo(() => {
    // 화면에서는 계산된 경과 시간과 포맷된 문자열만 사용
    const elapsedMs = calculateWorkoutElapsedMs(state, nowMs)
    return {
      elapsedMs,
      timerDisplay: formatElapsedMs(elapsedMs),
    }
  }, [nowMs, state])
}
