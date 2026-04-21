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
