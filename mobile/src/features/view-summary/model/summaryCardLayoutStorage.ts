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
  return Array.isArray(parsed)
    ? sanitizeSummaryCardIds(parsed)
    : DEFAULT_SUMMARY_CARD_IDS
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
