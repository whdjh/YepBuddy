import type {
  BodyPart,
  BodyPartDetail,
  RoutinePart,
} from "@/entities/workout-session"

export function toggleRoutinePartDetail(
  current: RoutinePart[],
  part: BodyPart,
  detail: BodyPartDetail,
) {
  return current.map((item) => {
    if (item.part !== part) return item
    const details = item.details ?? []
    return {
      ...item,
      details: details.includes(detail)
        ? details.filter((value) => value !== detail)
        : [...details, detail],
    }
  })
}
