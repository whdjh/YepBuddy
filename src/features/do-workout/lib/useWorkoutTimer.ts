import { useEffect, useMemo, useState } from "react"
import type { WorkoutState } from "@/entities/workout-session/model/workoutState"
import { formatElapsedMs } from "@/shared/lib/format"
import { calculateWorkoutElapsedMs } from "./calculateWorkoutElapsedMs"

export function useWorkoutTimer(state: WorkoutState) {
  const [nowMs, setNowMs] = useState(Date.now())

  useEffect(() => {
    // 운동이 진행 중이거나 일시정지 상태일 때만 타이머를 갱신
    if (state.phase !== "recording" && state.phase !== "paused") {
      return
    }

    const interval = setInterval(() => {
      // 현재 시각을 갱신해 elapsed time을 다시 계산
      setNowMs(Date.now())
    }, 50)

    return () => clearInterval(interval)
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
