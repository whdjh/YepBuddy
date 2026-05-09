import AsyncStorage from "@react-native-async-storage/async-storage"
import { parseJsonOrNull } from "@/shared/lib/json"
import {
  DEFAULT_SUMMARY_CARD_IDS,
  sanitizeSummaryCardIds,
  type SummaryCardId,
} from "./summaryCardLayout"

export const SUMMARY_CARD_LAYOUT_STORAGE_KEY = "yb:summary:cards"

// AsyncStorage에서 카드 순서를 불러옴. 없거나 파싱 실패 시 기본값 반환
export async function loadSummaryCardIds() {
  const value = await AsyncStorage.getItem(SUMMARY_CARD_LAYOUT_STORAGE_KEY)

  if (!value) {
    return DEFAULT_SUMMARY_CARD_IDS
  }

  const parsed = parseJsonOrNull<unknown>(value)
  if (!Array.isArray(parsed)) {
    return DEFAULT_SUMMARY_CARD_IDS
  }

  const sanitizedCardIds = sanitizeSummaryCardIds(parsed)

  // 사용자가 모든 카드를 숨긴 빈 배열은 유지하고, 깨진 저장값만 기본값으로 복구
  if (parsed.length > 0 && sanitizedCardIds.length === 0) {
    return DEFAULT_SUMMARY_CARD_IDS
  }

  return sanitizedCardIds
}

// 카드 순서를 sanitize한 뒤 AsyncStorage에 저장. 정제된 배열을 반환
export async function saveSummaryCardIds(cardIds: readonly SummaryCardId[]) {
  const normalizedCardIds = sanitizeSummaryCardIds(cardIds)
  await AsyncStorage.setItem(
    SUMMARY_CARD_LAYOUT_STORAGE_KEY,
    JSON.stringify(normalizedCardIds),
  )
  return normalizedCardIds
}
