import type { BodyPart } from "@/entities/workout-session"
import { BodyPartIcon } from "@/shared/ui/BodyPartIcon"

interface BodyPartBadgeProps {
  bodyPart?: BodyPart | null
  size?: "sm" | "md"
}

export function BodyPartBadge({ bodyPart, size = "sm" }: BodyPartBadgeProps) {
  return <BodyPartIcon bodyPart={bodyPart} size={size === "sm" ? "xs" : "md"} framed={false} />
}
