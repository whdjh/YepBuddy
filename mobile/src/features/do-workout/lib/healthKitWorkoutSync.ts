import {
  EMPTY_WORKOUT_LIVE_STATS,
  type WorkoutLiveStats,
} from "@/entities/workout-session/model/types"

const DEFAULT_SYNC_INTERVAL_MS = 5000
const DEFAULT_FALLBACK_POLLING_DELAY_MS = 10_000

interface HealthKitWorkoutSyncOptions<TimerHandle> {
  clearTimeout?: (timer: TimerHandle) => void
  fallbackPollingDelayMs?: number
  intervalMs?: number
  readLiveWorkoutStats: (params?: { startDate?: string }) => Promise<WorkoutLiveStats>
  setLiveStats: (stats: WorkoutLiveStats) => void
  setTimeout?: (callback: () => void, delay: number) => TimerHandle
  startWorkoutSession: () => Promise<unknown>
  subscribeLiveWorkoutStats?: (
    listener: (stats: WorkoutLiveStats) => void,
  ) => () => void
  workoutStartedAt?: string | null
}

// startWorkoutSession 반환값 타입 가드
function isWorkoutLiveStats(value: unknown): value is WorkoutLiveStats {
  return (
    typeof value === "object" &&
    value !== null &&
    "source" in value &&
    "status" in value &&
    "updatedAt" in value
  )
}

// 네이티브 이벤트 이후 polling fallback 필요 상태
function shouldUsePollingFallback(stats: WorkoutLiveStats) {
  return (
    stats.source === "healthKitFallback" ||
    stats.status === "waitingSensor" ||
    stats.status === "error"
  )
}

// HealthKit live stats 이벤트/폴링 동기화 시작
export function startHealthKitWorkoutSync<
  TimerHandle = ReturnType<typeof setTimeout>,
>({
  clearTimeout: cancelTimeout = clearTimeout as unknown as (
    timer: TimerHandle,
  ) => void,
  fallbackPollingDelayMs = DEFAULT_FALLBACK_POLLING_DELAY_MS,
  intervalMs = DEFAULT_SYNC_INTERVAL_MS,
  readLiveWorkoutStats,
  setLiveStats,
  setTimeout: scheduleTimeout = setTimeout as unknown as (
    callback: () => void,
    delay: number,
  ) => TimerHandle,
  startWorkoutSession,
  subscribeLiveWorkoutStats,
  workoutStartedAt,
}: HealthKitWorkoutSyncOptions<TimerHandle>) {
  let cancelled = false
  let pollingEnabled = false
  let timer: TimerHandle | null = null
  let fallbackTimer: TimerHandle | null = null
  let unsubscribeLiveStats: (() => void) | null = null

  // nullable timer 공통 해제
  const clearTimer = (value: TimerHandle | null) => {
    if (value !== null) {
      cancelTimeout(value)
    }
  }

  // 주기 polling timer 해제
  const clearScheduledSync = () => {
    clearTimer(timer)
    timer = null
  }

  // fallback polling 지연 timer 해제
  const clearFallbackPolling = () => {
    clearTimer(fallbackTimer)
    fallbackTimer = null
  }

  // 다음 polling sync 예약
  const scheduleNextSync = () => {
    if (cancelled || !pollingEnabled) {
      return
    }

    timer = scheduleTimeout(() => {
      timer = null
      void sync()
    }, intervalMs)
  }

  // HealthKit live stats 단건 조회 및 다음 polling 예약
  const sync = async () => {
    try {
      const stats = await readLiveWorkoutStats({
        startDate: workoutStartedAt ?? undefined,
      })
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

  // polling fallback 즉시 시작
  const startPolling = () => {
    if (cancelled || pollingEnabled) {
      return
    }

    pollingEnabled = true
    clearFallbackPolling()
    void sync()
  }

  // 네이티브 이벤트 미수신 상태의 polling fallback 예약
  const scheduleFallbackPolling = () => {
    if (cancelled || pollingEnabled || fallbackTimer !== null) {
      return
    }

    fallbackTimer = scheduleTimeout(() => {
      fallbackTimer = null
      startPolling()
    }, fallbackPollingDelayMs)
  }

  // 네이티브 live stats 이벤트 처리
  const handleLiveStats = (stats: WorkoutLiveStats) => {
    if (cancelled) {
      return
    }

    setLiveStats(stats)

    if (stats.status === "live" || stats.status === "paused") {
      clearFallbackPolling()
      return
    }

    if (shouldUsePollingFallback(stats)) {
      scheduleFallbackPolling()
    }
  }

  // 네이티브 구독 및 세션 시작 초기화
  const start = async () => {
    unsubscribeLiveStats = subscribeLiveWorkoutStats?.(handleLiveStats) ?? null

    if (unsubscribeLiveStats) {
      scheduleFallbackPolling()
    }

    const startStats = await startWorkoutSession().catch(() => null)
    if (cancelled) {
      return
    }

    if (isWorkoutLiveStats(startStats)) {
      handleLiveStats(startStats)
    }

    if (!unsubscribeLiveStats) {
      startPolling()
      return
    }
  }

  void start()

  // 동기화 리소스 정리 함수
  return () => {
    cancelled = true
    clearScheduledSync()
    clearFallbackPolling()
    unsubscribeLiveStats?.()
    unsubscribeLiveStats = null
  }
}
