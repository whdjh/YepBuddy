import type { RoutinePart } from "./routineCycle"

export type BodyPart =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"

export type BodyPartDetail =
  | "upper_chest"
  | "middle_chest"
  | "lower_chest"
  | "chest_fly"
  | "upper_back"
  | "lower_back"
  | "traps"
  | "hamstrings"
  | "quads"
  | "calves"
  | "glutes"
  | "front_delts"
  | "side_delts"
  | "rear_delts"
  | "biceps"
  | "triceps"

export const BODY_PART_DETAILS: Record<BodyPart, BodyPartDetail[]> = {
  chest: ["upper_chest", "middle_chest", "lower_chest", "chest_fly"],
  back: ["upper_back", "lower_back", "traps"],
  legs: ["hamstrings", "quads", "calves", "glutes"],
  shoulders: ["front_delts", "side_delts", "rear_delts"],
  arms: ["biceps", "triceps"],
  core: [],
}

export interface WorkoutBodyPartSet {
  part: BodyPart
  detail?: BodyPartDetail
  details?: BodyPartDetail[]
  setCount: number
}

export interface WorkoutSetCountUpdate {
  key: string
  setCount: number
}

export interface WorkoutLocation {
  lat: number
  lng: number
  /** 위치를 얻었을 때의 수평 오차 반경(m) */
  accuracyMeters?: number
}

export interface WorkoutRoutineSubstitution {
  cycleAnchorDateKey: string
  routineSessionId: string
  routineSessionIndex: number
  originalParts: RoutinePart[]
}

export interface StoredWorkoutSession {
  sessionId: string
  startedAt: string
  completedAt: string
  cardioStartedAt: string | null
  activeKcal: number | null
  averageHeartRate: number | null
  totalKcal: number | null
  healthKitWorkoutUUID: string | null
  calendarEventId: string | null
  isDeload: boolean
  routineSubstitution: WorkoutRoutineSubstitution | null
  bodyParts: WorkoutBodyPartSet[]
  memo: string
  /** 운동 결과 화면에 표시하는 운동 시작 위치 */
  location: WorkoutLocation | null
}

export type WorkoutMetricSource =
  | "iphoneLiveWorkout"
  | "watchMirroredWorkout"
  | "healthKitFallback"

export type WorkoutMetricStatus =
  | "idle"
  | "starting"
  | "waitingSensor"
  | "live"
  | "paused"
  | "ended"
  | "error"

export interface WorkoutLiveStats {
  heartRate: number | null
  activeKcal: number
  totalKcal: number
  source: WorkoutMetricSource
  status: WorkoutMetricStatus
  updatedAt: string | null
  errorCode?: string | null
}

export interface WorkoutSessionEndResult {
  averageHeartRate: number | null
  ended: boolean
  healthKitWorkoutUUID: string | null
}

export const EMPTY_WORKOUT_LIVE_STATS: WorkoutLiveStats = {
  heartRate: null,
  activeKcal: 0,
  totalKcal: 0,
  source: "healthKitFallback",
  status: "idle",
  updatedAt: null,
  errorCode: null,
}

export interface WorkoutHeartRateSample {
  bpm: number
  startDate: string
  endDate: string
}

export interface WorkoutHealthKitDetail {
  activeKcal: number | null
  averageHeartRate: number | null
  duration: number | null
  heartRateSamples: WorkoutHeartRateSample[]
  totalKcal: number | null
}

export interface WorkoutHealthKitWorkout {
  startDate: string
  endDate: string
  duration: number
  kcal: number
}
