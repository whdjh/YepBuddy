import { useCallback, useEffect, useRef, useState } from "react"
import {
  buildWeeklyRoutineProgressSnapshot,
  createWeeklyRoutineCycleProgress,
  loadWeeklyRoutineProgressSnapshot,
  markWeeklyRoutineSlotFilled,
  type WeeklyRoutineProgress,
  type WeeklyRoutineSession,
  type WeeklyRoutineProgressSnapshot,
} from "@/entities/workout-session"
import { getThisWeekDateRange } from "@/shared/lib/date"

export interface RoutineProgressResult {
  hasCustomSettings: boolean
  isRoutineEnabled: boolean
  progress: WeeklyRoutineProgress
  nextSuggestion: WeeklyRoutineSession | null
  isLoading: boolean
  reload: () => Promise<void>
  markSlotFilled: (slotId: string) => Promise<void>
}

// 운동 중 화면에서 주간 루틴 진행률과 다음 추천 세션을 계산
export function useRoutineProgress(): RoutineProgressResult {
  const loadRequestIdRef = useRef(0)
  const [snapshot, setSnapshot] = useState<WeeklyRoutineProgressSnapshot>(() =>
    buildWeeklyRoutineProgressSnapshot({
      cycleProgress: createWeeklyRoutineCycleProgress(
        getThisWeekDateRange().startDateKey,
      ),
      currentWeekStartDateKey: getThisWeekDateRange().startDateKey,
      featureStatus: "unasked",
      sessions: [],
      settings: null,
    }),
  )
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async () => {
    // 빠르게 reload가 겹쳐도 마지막 요청 결과만 화면 상태에 반영
    const requestId = loadRequestIdRef.current + 1
    loadRequestIdRef.current = requestId
    setIsLoading(true)
    try {
      const loadedSnapshot = await loadWeeklyRoutineProgressSnapshot()

      if (loadRequestIdRef.current !== requestId) {
        return
      }

      setSnapshot(loadedSnapshot)
    } catch {
      if (loadRequestIdRef.current !== requestId) {
        return
      }

      // 저장소/권한 오류가 나도 화면은 안전한 기본 상태로 유지
      setSnapshot(
        buildWeeklyRoutineProgressSnapshot({
          cycleProgress: createWeeklyRoutineCycleProgress(
            getThisWeekDateRange().startDateKey,
          ),
          currentWeekStartDateKey: getThisWeekDateRange().startDateKey,
          featureStatus: "unasked",
          sessions: [],
          settings: null,
        }),
      )
    } finally {
      if (loadRequestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(
    () => () => {
      // unmount 이후에는 진행 중 load 응답을 모두 무시
      loadRequestIdRef.current += 1
    },
    [],
  )

  const markSlotFilled = useCallback(
    async (slotId: string) => {
      await markWeeklyRoutineSlotFilled(slotId)
      await load()
    },
    [load],
  )

  return {
    hasCustomSettings: snapshot.hasCustomSettings,
    isRoutineEnabled: snapshot.isRoutineEnabled,
    progress: snapshot.progress,
    nextSuggestion: snapshot.nextSuggestion,
    isLoading,
    reload: load,
    markSlotFilled,
  }
}
