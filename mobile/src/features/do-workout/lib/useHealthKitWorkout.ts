import { useEffect } from "react"
import {
  endWorkoutSession,
  pauseWorkoutSession,
  readLiveWorkoutStats,
  resumeWorkoutSession,
  startWorkoutSession,
} from "@/entities/workout-session/api/healthKit"
import { useWorkout } from "@/entities/workout-session"

export function useHealthKitWorkout() {
  // 앱의 운동 세션 상태를 기준으로 HealthKit 세션을 동기화
  const { state, setLiveStats } = useWorkout()

  useEffect(() => {
    // 실제 기록 중일 때만 HealthKit 운동 세션과 실시간 수치 동기화를 시작
    if (state.phase !== "recording") {
      return
    }

    // effect cleanup 이후 늦게 도착한 비동기 응답은 무시
    let cancelled = false

    // 앱 세션이 recording 상태가 되면 HealthKit 세션도 함께 시작
    void startWorkoutSession()

    const sync = async () => {
      // HealthKit에서 현재 심박수/칼로리 등의 라이브 값을 읽어 store에 반영
      const stats = await readLiveWorkoutStats()
      if (!cancelled) {
        setLiveStats(stats)
      }
    }

    // 화면 진입 직후 값을 바로 한 번 읽고, 이후에는 주기적으로 갱신
    void sync()
    const interval = setInterval(() => {
      void sync()
    }, 5000)

    return () => {
      // recording 상태를 벗어나거나 화면이 내려가면 polling을 정리
      cancelled = true
      clearInterval(interval)
    }
  }, [setLiveStats, state.phase])

  return {
    // pause/resume/end 액션만 호출
    pauseWorkout: pauseWorkoutSession,
    resumeWorkout: resumeWorkoutSession,
    endWorkout: endWorkoutSession,
  }
}
