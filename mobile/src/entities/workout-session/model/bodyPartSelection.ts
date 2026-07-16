import { getWorkoutBodyPartDetails } from "./bodyPartSet"
import type {
  BodyPart,
  BodyPartDetail,
  WorkoutBodyPartSet,
} from "./types"

const DEFAULT_SET_COUNT = 10

function replacePartItems(
  current: WorkoutBodyPartSet[],
  part: BodyPart,
  replacement: WorkoutBodyPartSet[],
) {
  const firstPartIndex = current.findIndex((item) => item.part === part)
  const otherItems = current.filter((item) => item.part !== part)
  const insertionIndex =
    firstPartIndex < 0
      ? otherItems.length
      : Math.min(firstPartIndex, otherItems.length)

  return [
    ...otherItems.slice(0, insertionIndex),
    ...replacement,
    ...otherItems.slice(insertionIndex),
  ]
}

// 상위 부위는 해당 부위의 세부 항목까지 한 번에 선택하거나 해제
export function getNextBodyPartsAfterPartToggle(
  current: WorkoutBodyPartSet[],
  part: BodyPart,
): WorkoutBodyPartSet[] {
  const exists = current.some((item) => item.part === part)

  return exists
    ? current.filter((item) => item.part !== part)
    : [...current, { part, setCount: DEFAULT_SET_COUNT }]
}

// 세부 부위가 있으면 상위 항목 대신 선택된 세부 항목만 각각 유지
export function getNextBodyPartsAfterDetailToggle(
  current: WorkoutBodyPartSet[],
  part: BodyPart,
  detail: BodyPartDetail,
): WorkoutBodyPartSet[] {
  const partItems = current.filter((item) => item.part === part)
  const selectedDetails = Array.from(
    new Set(getWorkoutBodyPartDetails(current, part)),
  )
  const isSelected = selectedDetails.includes(detail)
  const nextDetails = isSelected
    ? selectedDetails.filter((item) => item !== detail)
    : [...selectedDetails, detail]

  if (nextDetails.length === 0) {
    const restoredSetCount =
      partItems.find((item) => item.detail === detail)?.setCount ??
      partItems[0]?.setCount ??
      DEFAULT_SET_COUNT

    return replacePartItems(current, part, [
      { part, setCount: restoredSetCount },
    ])
  }

  const parentSetCount = partItems.find(
    (item) => !item.detail && (!item.details || item.details.length === 0),
  )?.setCount

  const replacement = nextDetails.map((nextDetail) => {
    const existingItem = partItems.find(
      (item) =>
        item.detail === nextDetail || item.details?.includes(nextDetail),
    )
    const setCount =
      existingItem?.setCount ??
      (selectedDetails.length === 0 ? parentSetCount : undefined) ??
      DEFAULT_SET_COUNT

    return { part, detail: nextDetail, setCount }
  })

  return replacePartItems(current, part, replacement)
}
