import { getWorkoutBodyPartSetLabel } from "@/entities/workout-session/model/bodyPartSet"
import type { StoredWorkoutSession } from "@/entities/workout-session/model/types"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"

export function getBodyPartsLabel(
  session: StoredWorkoutSession | null,
  fallback: string,
): string {
  if (!session || session.bodyParts.length === 0) return fallback
  return session.bodyParts
    .map((item) => getWorkoutBodyPartSetLabel(item, { bodyPartLabel, bodyPartDetailLabel }))
    .join(", ")
}

export function getRepresentativeBodyPart(session: StoredWorkoutSession | null) {
  return session?.bodyParts[0]?.part ?? null
}
