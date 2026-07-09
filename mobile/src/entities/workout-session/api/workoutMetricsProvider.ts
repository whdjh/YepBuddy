import type {
  WorkoutLiveStats,
  WorkoutMetricSource,
  WorkoutMetricStatus,
} from "../model/types"
import { EMPTY_WORKOUT_LIVE_STATS } from "../model/types"
import { normalizeMetricCount } from "../model/metricNormalization"

// 운동 센서 선택 옵션
export type WorkoutSensorPreference = "auto" | "airpods" | "appleWatch"

// 실시간 운동 지표 provider 공통 계약
export interface WorkoutMetricProvider {
  source: WorkoutMetricSource
  isAvailable: () => boolean
  recover: () => Promise<WorkoutLiveStats>
  start: () => Promise<WorkoutLiveStats>
  pause: () => Promise<WorkoutLiveStats>
  resume: () => Promise<WorkoutLiveStats>
  end: () => Promise<WorkoutLiveStats>
  read: (params?: { startDate?: string }) => Promise<WorkoutLiveStats>
  subscribe: (listener: (stats: WorkoutLiveStats) => void) => () => void
}

// provider별 partial live stats 입력값
interface PartialWorkoutLiveStats {
  heartRate?: number | null
  activeKcal?: number | null
  totalKcal?: number | null
  source?: WorkoutMetricSource
  status?: WorkoutMetricStatus
  updatedAt?: string | null
  errorCode?: string | null
}

export function normalizeWorkoutLiveStats(
  stats: PartialWorkoutLiveStats,
): WorkoutLiveStats {
  // 심박수 nullable 정수값 정규화
  const heartRate =
    typeof stats.heartRate === "number" && Number.isFinite(stats.heartRate)
      ? Math.max(0, Math.round(stats.heartRate))
      : null

  // LiveStats 기본값 병합 및 숫자 필드 보정
  return {
    heartRate,
    activeKcal: normalizeMetricCount(stats.activeKcal),
    totalKcal: normalizeMetricCount(stats.totalKcal),
    source: stats.source ?? EMPTY_WORKOUT_LIVE_STATS.source,
    status: stats.status ?? EMPTY_WORKOUT_LIVE_STATS.status,
    updatedAt: stats.updatedAt ?? null,
    errorCode: stats.errorCode ?? null,
  }
}

// 센서 선호도 기반 metric source 선택
export function resolveWorkoutMetricSource(
  preference: WorkoutSensorPreference = "auto",
): WorkoutMetricSource {
  if (preference === "appleWatch") {
    return "watchMirroredWorkout"
  }

  return "iphoneLiveWorkout"
}
