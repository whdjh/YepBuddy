import { useCallback, useEffect, useRef, useState } from "react"
import {
  buildRoutinePartHistoryPrefill,
  buildWorkoutHistoryPrefill,
  getAllStoredWorkoutSessions,
  type RoutinePart,
  type StoredWorkoutSession,
  type WorkoutBodyPartSet,
  type WorkoutHistoryPrefill,
} from "@/entities/workout-session"

// 이전 운동 기록이 없거나 선택한 운동 구성이 없을 때 쓰는 빈 프리필 결과
const EMPTY_PREFILL: WorkoutHistoryPrefill = {
  bodyParts: [],
  memoPlaceholder: null,
  sourceSessionId: null,
}

// 운동 중 화면에서 이전 완료 세션 기반 프리필 계산기를 제공
export function useWorkoutHistoryPrefill() {
  const [sessions, setSessions] = useState<StoredWorkoutSession[]>([])
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    // 완료된 운동 세션 목록을 한 번 로드해 이후 선택 변경 때 순수 계산에 사용
    void getAllStoredWorkoutSessions()
      .then((loadedSessions) => {
        if (mountedRef.current) {
          setSessions(loadedSessions)
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setSessions([])
        }
      })

    return () => {
      mountedRef.current = false
    }
  }, [])

  // 수동 선택한 운동 부위 구성 기준 프리필 조회
  const getPrefill = useCallback(
    (bodyParts: WorkoutBodyPartSet[]) =>
      bodyParts.length > 0
        ? buildWorkoutHistoryPrefill(sessions, bodyParts)
        : EMPTY_PREFILL,
    [sessions],
  )

  // 루틴 슬롯의 운동 부위 구성 기준 프리필 조회
  const getRoutinePrefill = useCallback(
    (routineParts: RoutinePart[]) =>
      routineParts.length > 0
        ? buildRoutinePartHistoryPrefill(sessions, routineParts)
        : EMPTY_PREFILL,
    [sessions],
  )

  return {
    getPrefill,
    getRoutinePrefill,
  }
}
