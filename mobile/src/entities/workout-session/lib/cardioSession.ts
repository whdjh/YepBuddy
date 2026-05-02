import { getTimestampMsFromIso } from "@/shared/lib/date"

interface GetCardioDurationMinutesParams {
  cardioStartedAt?: string | null
  completedAt: string
}

interface AppendCardioDurationToTitleParams {
  title: string
  cardioLabel: string
  cardioMinutes: number | null
}

/** 유산소 시작 시각부터 종료 시각까지를 초 단위 없이 총 분으로 계산 */
export function getCardioDurationMinutes({
  cardioStartedAt,
  completedAt,
}: GetCardioDurationMinutesParams) {
  if (!cardioStartedAt) {
    return null
  }

  const startedAtMs = getTimestampMsFromIso(cardioStartedAt)
  const completedAtMs = getTimestampMsFromIso(completedAt)

  if (startedAtMs === null || completedAtMs === null) {
    return null
  }

  return Math.floor(Math.max(0, completedAtMs - startedAtMs) / 60000)
}

/** 기존 운동 제목 뒤에 유산소 분 라벨 추가 */
export function appendCardioDurationToTitle({
  title,
  cardioLabel,
  cardioMinutes,
}: AppendCardioDurationToTitleParams) {
  if (cardioMinutes === null) {
    return title
  }

  return `${title} + ${cardioLabel}(${cardioMinutes})`
}
