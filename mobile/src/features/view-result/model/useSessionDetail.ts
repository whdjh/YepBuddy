import { useEffect, useState } from "react"
import {
  getStoredWorkoutSession,
  getWorkoutDetail,
  type StoredWorkoutSession,
  type WorkoutHealthKitDetail,
} from "@/entities/workout-session"

interface SessionDetailData {
  hk: WorkoutHealthKitDetail | null
  stored: StoredWorkoutSession | null
}

// 결과 화면이 sessionId 하나로 로컬 메타와 HealthKit 상세를 함께 읽도록 묶음
export function useSessionDetail(sessionId: string) {
  const [data, setData] = useState<SessionDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // sessionId가 바뀌거나 화면이 내려간 뒤 늦게 도착한 응답은 무시
    let active = true

    const load = async () => {
      if (!sessionId) {
        if (active) {
          setData(null)
          setIsLoading(false)
        }
        return
      }

      if (active) {
        setIsLoading(true)
      }

      try {
        const [stored, hk] = await Promise.all([
          getStoredWorkoutSession(sessionId),
          getWorkoutDetail(sessionId),
        ])

        if (!active) {
          return
        }

        setData({ hk, stored })
      } catch {
        if (!active) {
          return
        }

        setData(null)
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [sessionId])

  return {
    data,
    isLoading,
  }
}
