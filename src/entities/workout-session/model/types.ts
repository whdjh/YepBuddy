export type BodyPart =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core"

export interface WorkoutBodyPartSet {
  part: BodyPart
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
  bodyParts: WorkoutBodyPartSet[]
  memo: string
  location: WorkoutLocation | null
}

export interface WorkoutLiveStats {
  heartRate: number | null
  activeKcal: number
  totalKcal: number
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
