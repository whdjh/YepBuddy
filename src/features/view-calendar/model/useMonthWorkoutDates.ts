import { useEffect, useMemo, useState } from "react"
import {
  getStoredWorkoutSessionsInRange,
  type StoredWorkoutSession,
} from "@/entities/workout-session"
import { getLocalDateKeyFromIso } from "@/shared/lib/date"
import type { MonthWorkoutDates } from "./types"

function pad2(value: number) {
  return String(value).padStart(2, "0")
}

function getDateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

function getMonthRange(year: number, month: number) {
  return {
    endDateKey: getDateKey(year, month, new Date(year, month, 0).getDate()),
    startDateKey: getDateKey(year, month, 1),
  }
}

/** 지정한 월에 저장된 완료 운동 세션을 YYYY-MM-DD -> sessionId 형태로 읽음 */
export function useMonthWorkoutDates(
  year: number,
  month: number,
  refreshKey = 0,
): MonthWorkoutDates {
  const [workoutDates, setWorkoutDates] = useState<Record<string, string>>({})

  const range = useMemo(() => getMonthRange(year, month), [year, month])

  useEffect(() => {
    let mounted = true
    let requestId = 0

    const refresh = async () => {
      const currentRequestId = ++requestId

      try {
        const sessions = await getStoredWorkoutSessionsInRange(
          range.startDateKey,
          range.endDateKey,
        )

        if (!mounted || currentRequestId !== requestId) {
          return
        }

        const nextWorkoutDates = sessions.reduce<Record<string, string>>(
          (accumulator, session: StoredWorkoutSession) => {
            accumulator[getLocalDateKeyFromIso(session.startedAt)] =
              session.sessionId
            return accumulator
          },
          {},
        )

        setWorkoutDates(nextWorkoutDates)
      } catch {
        if (mounted && currentRequestId === requestId) {
          setWorkoutDates({})
        }
      }
    }

    void refresh()

    return () => {
      mounted = false
    }
  }, [range.endDateKey, range.startDateKey, refreshKey])

  return { workoutDates }
}
