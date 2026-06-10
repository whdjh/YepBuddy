export const SUMMARY_CARD_DEFINITIONS = [
  { id: "todayWorkout", width: "full" },
  { id: "workoutTime", width: "half" },
  { id: "sets", width: "half" },
  { id: "latestSession", width: "half" },
  { id: "startWorkout", width: "half" },
  { id: "routineCycleSessions", width: "full" },
] as const

export type SummaryCardId = (typeof SUMMARY_CARD_DEFINITIONS)[number]["id"]
export type SummaryCardWidth =
  (typeof SUMMARY_CARD_DEFINITIONS)[number]["width"]
export type SummaryCardVisualDirection = "left" | "right" | "up" | "down"

export interface SummaryCardDefinition {
  id: SummaryCardId
  width: SummaryCardWidth
}

export const DEFAULT_SUMMARY_CARD_IDS: SummaryCardId[] =
  SUMMARY_CARD_DEFINITIONS.map((card) => card.id)

const validSummaryCardIds = new Set<string>(DEFAULT_SUMMARY_CARD_IDS)
const LEGACY_SUMMARY_CARD_ID_MAP: Record<string, SummaryCardId> = {
  weeklySessions: "routineCycleSessions",
}

function normalizeSummaryCardId(value: unknown): SummaryCardId | null {
  if (typeof value !== "string") {
    return null
  }

  if (validSummaryCardIds.has(value)) {
    return value as SummaryCardId
  }

  return LEGACY_SUMMARY_CARD_ID_MAP[value] ?? null
}

// 값이 유효한 SummaryCardId인지 타입 가드로 검사
export function isSummaryCardId(value: unknown): value is SummaryCardId {
  return typeof value === "string" && validSummaryCardIds.has(value)
}

// 외부 저장소에서 불러온 값을 SummaryCardId[] 로 정규화. 유효하지 않으면 기본값 반환
export function normalizeSummaryCardIds(values: unknown): SummaryCardId[] {
  if (!Array.isArray(values)) {
    return DEFAULT_SUMMARY_CARD_IDS
  }

  const normalized = sanitizeSummaryCardIds(values)

  return normalized.length > 0 ? normalized : DEFAULT_SUMMARY_CARD_IDS
}

// 배열에서 유효하지 않은 항목과 중복을 제거
export function sanitizeSummaryCardIds(values: readonly unknown[]) {
  const normalizedCardIds = values
    .map(normalizeSummaryCardId)
    .filter((id): id is SummaryCardId => id !== null)

  return normalizedCardIds.filter(
    (id, index, ids) => ids.indexOf(id) === index,
  )
}

// 카드 목록에서 특정 카드를 제거한 새 배열 반환
export function removeSummaryCard(
  cardIds: readonly SummaryCardId[],
  cardId: SummaryCardId,
) {
  return cardIds.filter((id) => id !== cardId)
}

// 카드 목록 끝에 카드를 추가. 이미 존재하면 원본 복사본 반환
export function addSummaryCard(
  cardIds: readonly SummaryCardId[],
  cardId: SummaryCardId,
) {
  if (cardIds.includes(cardId)) {
    return [...cardIds]
  }

  return [...cardIds, cardId]
}

// 카드를 direction(-1: 앞, +1: 뒤)으로 한 칸 이동. 범위를 벗어나면 원본 복사본 반환
export function moveSummaryCard(
  cardIds: readonly SummaryCardId[],
  cardId: SummaryCardId,
  direction: -1 | 1,
) {
  const fromIndex = cardIds.indexOf(cardId)
  const toIndex = fromIndex + direction

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    toIndex >= cardIds.length
  ) {
    return [...cardIds]
  }

  const nextCardIds = [...cardIds]
  const [movedCardId] = nextCardIds.splice(fromIndex, 1)

  nextCardIds.splice(toIndex, 0, movedCardId)

  return nextCardIds
}

// 같은 행 안에서만 카드를 좌우로 이동. 행 경계를 넘는 이동X
export function moveSummaryCardWithinRow(
  cardIds: readonly SummaryCardId[],
  cardId: SummaryCardId,
  direction: -1 | 1,
) {
  const rows = buildSummaryCardRows(cardIds)
  let rowStartIndex = 0

  for (const row of rows) {
    const fromRowIndex = row.indexOf(cardId)

    if (fromRowIndex < 0) {
      rowStartIndex += row.length
      continue
    }

    const toRowIndex = fromRowIndex + direction

    if (toRowIndex < 0 || toRowIndex >= row.length) {
      return [...cardIds]
    }

    const nextCardIds = [...cardIds]
    const fromIndex = rowStartIndex + fromRowIndex
    const toIndex = rowStartIndex + toRowIndex
    const [movedCardId] = nextCardIds.splice(fromIndex, 1)

    nextCardIds.splice(toIndex, 0, movedCardId)

    return nextCardIds
  }

  return [...cardIds]
}

function moveSummaryCardToIndex(
  cardIds: readonly SummaryCardId[],
  fromIndex: number,
  toIndex: number,
) {
  const boundedToIndex = Math.max(0, Math.min(cardIds.length - 1, toIndex))

  if (
    fromIndex < 0 ||
    fromIndex >= cardIds.length ||
    boundedToIndex === fromIndex
  ) {
    return [...cardIds]
  }

  const nextCardIds = [...cardIds]
  const [movedCardId] = nextCardIds.splice(fromIndex, 1)

  nextCardIds.splice(boundedToIndex, 0, movedCardId)

  return nextCardIds
}

export function moveSummaryCardByVisualDirection(
  cardIds: readonly SummaryCardId[],
  cardId: SummaryCardId,
  direction: SummaryCardVisualDirection,
  steps = 1,
) {
  const rows = buildSummaryCardRows(cardIds)
  let rowStartIndex = 0
  const moveSteps = Math.max(1, Math.floor(steps))

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex]
    const columnIndex = row.indexOf(cardId)

    if (columnIndex < 0) {
      rowStartIndex += row.length
      continue
    }

    const fromIndex = rowStartIndex + columnIndex

    if (direction === "left") {
      return moveSummaryCardToIndex(cardIds, fromIndex, fromIndex - moveSteps)
    }

    if (direction === "right") {
      return moveSummaryCardToIndex(cardIds, fromIndex, fromIndex + moveSteps)
    }

    if (direction === "up") {
      const targetRowIndex = Math.max(0, rowIndex - moveSteps)
      const targetIndex = rows
        .slice(0, targetRowIndex)
        .reduce((sum, previousRow) => sum + previousRow.length, 0)

      return moveSummaryCardToIndex(
        cardIds,
        fromIndex,
        targetIndex,
      )
    }

    if (direction === "down") {
      const targetRowIndex = Math.min(rows.length - 1, rowIndex + moveSteps)
      const targetRowEndIndex = rows
        .slice(0, targetRowIndex + 1)
        .reduce((sum, previousRow) => sum + previousRow.length, 0)
      const targetIndex =
        fromIndex < targetRowEndIndex
          ? targetRowEndIndex - 1
          : targetRowEndIndex

      return moveSummaryCardToIndex(
        cardIds,
        fromIndex,
        targetIndex,
      )
    }

    return [...cardIds]
  }

  return [...cardIds]
}

// 카드 정의(id, width)를 반환
export function getSummaryCardDefinition(cardId: SummaryCardId) {
  return SUMMARY_CARD_DEFINITIONS.find((card) => card.id === cardId)
}

// 카드의 width("full" | "half")를 반환. 정의가 없으면 "full" 폴백
export function getSummaryCardWidth(cardId: SummaryCardId) {
  return getSummaryCardDefinition(cardId)?.width ?? "full"
}

// 카드 ID 목록을 행(row) 단위로 그루핑. full 카드는 단독 행, half 카드는 2개씩 묶음
export function buildSummaryCardRows(cardIds: readonly SummaryCardId[]) {
  const rows: SummaryCardId[][] = []
  let currentHalfRow: SummaryCardId[] = []

  for (const cardId of cardIds) {
    if (getSummaryCardWidth(cardId) === "full") {
      if (currentHalfRow.length > 0) {
        rows.push(currentHalfRow)
        currentHalfRow = []
      }

      rows.push([cardId])
      continue
    }

    currentHalfRow.push(cardId)

    if (currentHalfRow.length === 2) {
      rows.push(currentHalfRow)
      currentHalfRow = []
    }
  }

  if (currentHalfRow.length > 0) {
    rows.push(currentHalfRow)
  }

  return rows
}
