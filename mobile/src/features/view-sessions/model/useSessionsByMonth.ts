import { useEffect, useState } from "react"
import {
  getStoredWorkoutSessionsForMonth,
  getWorkoutSummariesForMonth,
  type BodyPart,
  type StoredWorkoutSession,
} from "@/entities/workout-session"
import type { SessionListItem } from "./types"

function getSessionBodyParts(session: StoredWorkoutSession): BodyPart[] {
  return session.bodyParts.map((item) => item.part)
}

function getSessionTotalSets(session: StoredWorkoutSession) {
  return session.bodyParts.reduce((sum, item) => sum + item.setCount, 0)
}

export async function loadSessionsByMonth(year: number, month: number) {
  // 로컬에 저장한 세션 정보와 HealthKit 요약 정보를 동시에 조회
  const [storedSessions, hkWorkouts] = await Promise.all([
    getStoredWorkoutSessionsForMonth(year, month),
    getWorkoutSummariesForMonth(year, month),
  ])

  // 세션 ID(= workout.startDate)로 매칭해서 kcal 정보 찾기
  const hkWorkoutMap = new Map(
    hkWorkouts.map((workout) => [workout.startDate, workout]),
  )

  return storedSessions.map<SessionListItem>((session) => {
    const workout = hkWorkoutMap.get(session.sessionId) ?? null

    return {
      sessionId: session.sessionId,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      bodyParts: getSessionBodyParts(session),
      totalSets: getSessionTotalSets(session),
      kcal: workout?.kcal ?? null,
      date: new Date(session.startedAt),
    }
  })
}

export function useSessionsByMonth(
  year: number,
  month: number,
  refreshKey = 0,
) {
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      setIsLoading(true)

      try {
        // 특정 연/월 데이터만 단건으로 다시 읽어와 화면 상태를 교체
        const nextSessions = await loadSessionsByMonth(year, month)
        if (!active) {
          return
        }

        setSessions(nextSessions)
      } catch {
        if (!active) {
          return
        }

        // 조회 실패 시 이전 값을 남기지 않고 빈 목록으로 정리
        setSessions([])
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
  }, [year, month, refreshKey])

  return {
    sessions,
    isLoading,
  }
}
