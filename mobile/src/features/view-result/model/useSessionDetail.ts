import { useCallback, useEffect, useRef, useState } from "react"
import {
  getWorkoutSessionDetailData,
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
  const isMountedRef = useRef(false)
  const requestIdRef = useRef(0)
  const sessionIdRef = useRef(sessionId)
  sessionIdRef.current = sessionId

  const load = useCallback(
    async (showLoading: boolean) => {
      if (!isMountedRef.current || sessionIdRef.current !== sessionId) {
        return null
      }

      const requestId = ++requestIdRef.current
      const isCurrentRequest = () =>
        isMountedRef.current &&
        sessionIdRef.current === sessionId &&
        requestId === requestIdRef.current

      if (!sessionId) {
        if (isCurrentRequest()) {
          setData(null)
          setIsLoading(false)
        }
        return null
      }

      if (showLoading && isMountedRef.current) {
        setIsLoading(true)
      }

      try {
        const detailData = await getWorkoutSessionDetailData(sessionId)

        if (!isCurrentRequest()) {
          return null
        }

        const nextData = {
          hk: detailData.healthKitDetail,
          stored: detailData.storedSession,
        }
        setData(nextData)
        return nextData
      } catch {
        if (showLoading && isCurrentRequest()) {
          setData(null)
        }
        return null
      } finally {
        if (showLoading && isCurrentRequest()) {
          setIsLoading(false)
        }
      }
    },
    [sessionId],
  )

  useEffect(() => {
    isMountedRef.current = true
    void load(true)

    // sessionId가 바뀌거나 화면이 내려간 뒤 늦게 도착한 응답은 무시
    return () => {
      isMountedRef.current = false
      requestIdRef.current += 1
    }
  }, [load])

  const reload = useCallback(() => load(false), [load])

  return {
    data,
    isLoading,
    reload,
  }
}
