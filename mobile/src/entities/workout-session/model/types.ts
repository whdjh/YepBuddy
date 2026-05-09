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

export interface WorkoutLocation {
  lat: number
  lng: number
}

export interface StoredWorkoutSession {
  sessionId: string
  startedAt: string
  completedAt: string
  cardioStartedAt: string | null
  bodyParts: WorkoutBodyPartSet[]
  memo: string
  location: WorkoutLocation | null
}

export interface WorkoutLiveStats {
  heartRate: number | null
  activeKcal: number
  totalKcal: number
}

export const EMPTY_WORKOUT_LIVE_STATS: WorkoutLiveStats = {
  heartRate: null,
  activeKcal: 0,
  totalKcal: 0,
}

export interface WorkoutHeartRateSample {
  bpm: number
  startDate: string
  endDate: string
}

export interface WorkoutHealthKitDetail {
  activeKcal: number | null
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
