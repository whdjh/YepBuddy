import type { BodyPart } from "@/entities/workout-session"

export type SessionFilterValue = BodyPart | "all"

export interface SessionListItem {
  sessionId: string
  startedAt: string
  completedAt: string | null
  bodyParts: BodyPart[]
  totalSets: number
  kcal: number | null
  date: Date
}

export interface SessionMonthEntry {
  year: number
  month: number
}
