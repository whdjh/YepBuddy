import {
  EMPTY_WORKOUT_LIVE_STATS,
  type WorkoutLiveStats,
} from "@/entities/workout-session/model/types"

const DEFAULT_SYNC_INTERVAL_MS = 5000

// useHealthKitWorkout에서 분리한 HealthKit 시작 + live stats polling 흐름.
interface HealthKitWorkoutSyncOptions<TimerHandle> {
  clearTimeout?: (timer: TimerHandle) => void
  intervalMs?: number
  readLiveWorkoutStats: () => Promise<WorkoutLiveStats>
  setLiveStats: (stats: WorkoutLiveStats) => void
  setTimeout?: (callback: () => void, delay: number) => TimerHandle
  startWorkoutSession: () => Promise<unknown>
}

export function startHealthKitWorkoutSync<
  TimerHandle = ReturnType<typeof setTimeout>,
>({
  clearTimeout: cancelTimeout = clearTimeout as unknown as (
    timer: TimerHandle,
  ) => void,
  intervalMs = DEFAULT_SYNC_INTERVAL_MS,
  readLiveWorkoutStats,
  setLiveStats,
  setTimeout: scheduleTimeout = setTimeout as unknown as (
    callback: () => void,
    delay: number,
  ) => TimerHandle,
  startWorkoutSession,
}: HealthKitWorkoutSyncOptions<TimerHandle>) {
  let cancelled = false
  let timer: TimerHandle | null = null

  const clearScheduledSync = () => {
    if (timer === null) {
      return
    }

    cancelTimeout(timer)
    timer = null
  }

  // 이전 sync가 끝난 뒤에만 다음 polling을 예약해서 요청 겹침을 막는다.
  const scheduleNextSync = () => {
    if (cancelled) {
      return
    }

    timer = scheduleTimeout(() => {
      timer = null
      void sync()
    }, intervalMs)
  }

  const sync = async () => {
    try {
      const stats = await readLiveWorkoutStats()
      if (!cancelled) {
        setLiveStats(stats)
      }
    } catch {
      if (!cancelled) {
        setLiveStats(EMPTY_WORKOUT_LIVE_STATS)
      }
    } finally {
      scheduleNextSync()
    }
  }

  // HealthKit 권한/초기화가 끝난 뒤 첫 sync를 시작한다.
  const start = async () => {
    await startWorkoutSession().catch(() => undefined)

    if (!cancelled) {
      void sync()
    }
  }

  void start()

  return () => {
    cancelled = true
    clearScheduledSync()
  }
}
