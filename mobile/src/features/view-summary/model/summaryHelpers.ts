import {
  appendCardioDurationToTitle,
  getCardioDurationMinutes,
  getWorkoutBodyPartSetLabel,
  type StoredWorkoutSession,
} from "@/entities/workout-session"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"

export function getBodyPartsLabel(
  session: StoredWorkoutSession | null,
  fallback: string,
  cardioLabel: string,
): string {
  if (!session) return fallback
  const cardioMinutes = getCardioDurationMinutes({
    cardioStartedAt: session.cardioStartedAt,
    completedAt: session.completedAt,
  })

  if (session.bodyParts.length === 0) {
    return cardioMinutes === null
      ? fallback
      : `${cardioLabel}(${cardioMinutes})`
  }

  const bodyPartTitle = session.bodyParts
    .map((item) => getWorkoutBodyPartSetLabel(item, { bodyPartLabel, bodyPartDetailLabel }))
    .join(", ")

  return appendCardioDurationToTitle({
    title: bodyPartTitle,
    cardioLabel,
    cardioMinutes,
  })
}

export function getRepresentativeBodyPart(session: StoredWorkoutSession | null) {
  return session?.bodyParts[0]?.part ?? null
}
