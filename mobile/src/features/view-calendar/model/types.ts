import type { BodyPart } from "@/entities/workout-session"

export interface DayWorkout {
  sessionId: string | null
  bodyParts: BodyPart[]
  hasCardio: boolean
  isDeload: boolean
}

export interface MonthWorkoutDates {
  workoutDates: Record<string, DayWorkout>
}
