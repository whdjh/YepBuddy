import { useCallback, useEffect, useMemo, useState } from "react"
import {
  DEFAULT_SUMMARY_CARD_IDS,
  SUMMARY_CARD_DEFINITIONS,
  addSummaryCard,
  buildSummaryCardRows,
  moveSummaryCardByVisualDirection,
  removeSummaryCard,
  type SummaryCardId,
  type SummaryCardVisualDirection,
} from "./summaryCardLayout"
import {
  loadSummaryCardIds,
  saveSummaryCardIds,
} from "./summaryCardLayoutStorage"

export function useSummaryCardLayout() {
  // 기본값으로 초기화 후 AsyncStorage 로드 완료 시 교체
  const [cardIds, setCardIds] = useState<SummaryCardId[]>(
    DEFAULT_SUMMARY_CARD_IDS,
  )

  // 마운트 시 저장된 카드 순서를 불러옴. 언마운트 후 setState 방지를 위해 isMounted 플래그 사용
  useEffect(() => {
    let isMounted = true

    loadSummaryCardIds()
      .then((storedCardIds) => {
        if (isMounted) {
          setCardIds(storedCardIds)
        }
      })
      .catch(() => {
        if (isMounted) {
          setCardIds(DEFAULT_SUMMARY_CARD_IDS)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  // 상태 업데이트와 AsyncStorage 저장을 동시에 처리
  const persistCardIds = useCallback((nextCardIds: SummaryCardId[]) => {
    setCardIds(nextCardIds)
    void saveSummaryCardIds(nextCardIds)
  }, [])

  // 카드를 목록 끝에 추가
  const addCard = useCallback(
    (cardId: SummaryCardId) => {
      persistCardIds(addSummaryCard(cardIds, cardId))
    },
    [cardIds, persistCardIds],
  )

  // 카드를 목록에서 제거
  const removeCard = useCallback(
    (cardId: SummaryCardId) => {
      persistCardIds(removeSummaryCard(cardIds, cardId))
    },
    [cardIds, persistCardIds],
  )

  const moveCardByVisualDirection = useCallback(
    (
      cardId: SummaryCardId,
      direction: SummaryCardVisualDirection,
      steps?: number,
    ) => {
      persistCardIds(
        moveSummaryCardByVisualDirection(cardIds, cardId, direction, steps),
      )
    },
    [cardIds, persistCardIds],
  )

  // O(1) 조회를 위해 현재 표시 중인 카드 ID를 Set으로 관리
  const visibleCardIds = useMemo(() => new Set(cardIds), [cardIds])
  // 전체 카드 정의에 isVisible 플래그를 붙여 편집 모달에서 사용
  const availableCards = useMemo(
    () =>
      SUMMARY_CARD_DEFINITIONS.map((card) => ({
        ...card,
        isVisible: visibleCardIds.has(card.id),
      })),
    [visibleCardIds],
  )
  // 렌더링용 행 구조 (full 단독, half 2개씩 묶음)
  const cardRows = useMemo(() => buildSummaryCardRows(cardIds), [cardIds])

  return {
    cardIds,
    cardRows,
    availableCards,
    addCard,
    removeCard,
    moveCardByVisualDirection,
  }
}
