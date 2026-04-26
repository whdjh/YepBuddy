import type { BodyPart } from "@/entities/workout-session"

export interface DayWorkout {
  sessionId: string
  bodyParts: BodyPart[]
}

export interface MonthWorkoutDates {
  workoutDates: Record<string, DayWorkout>
}
