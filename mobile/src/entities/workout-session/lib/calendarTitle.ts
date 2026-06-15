import type { WorkoutBodyPartSet } from "../model/types"
import { getWorkoutBodyPartSetLabel } from "../model/bodyPartSet"
import { getCardioDurationMinutes } from "./cardioSession"

interface WorkoutCalendarTitleLabels {
  bodyPartLabel: (part: WorkoutBodyPartSet["part"]) => string
  bodyPartDetailLabel: (
    detail: NonNullable<WorkoutBodyPartSet["details"]>[number],
  ) => string
  cardioLabel: string
  cardioMinuteUnit: string
  defaultTitle: string
  deloadLabel: string
}

interface WorkoutCalendarTitleParams {
  bodyParts: WorkoutBodyPartSet[]
  cardioStartedAt?: string | null
  completedAt: string
  isDeload?: boolean
}

/** 운동 부위, 세트 수, 유산소, 디로드 상태를 캘린더 이벤트 제목 문자열로 만듬 */
export function formatWorkoutCalendarTitle(
  params: WorkoutCalendarTitleParams,
  labels: WorkoutCalendarTitleLabels,
) {
  const bodyPartTitle =
    params.bodyParts.length === 0
      ? labels.defaultTitle
      : params.bodyParts
          .map((item) => {
            const label = getWorkoutBodyPartSetLabel(item, {
              bodyPartLabel: labels.bodyPartLabel,
              bodyPartDetailLabel: labels.bodyPartDetailLabel,
            })
            return `${label}(${item.setCount})`
          })
          .join(", ")
  const cardioMinutes = getCardioDurationMinutes({
    cardioStartedAt: params.cardioStartedAt,
    completedAt: params.completedAt,
  })
  const title =
    cardioMinutes === null
      ? bodyPartTitle
      : `${bodyPartTitle} + ${labels.cardioLabel} ${cardioMinutes}${labels.cardioMinuteUnit}`

  return params.isDeload ? `(${labels.deloadLabel}) ${title}` : title
}
