import { useCallback, useState } from "react"
import type { SummaryCardId } from "./summaryCardLayout"

export function useSummaryEditing(addCard: (cardId: SummaryCardId) => void) {
  // 편집/카드 선택 상태
  const [isEditing, setIsEditing] = useState(false)
  const [isCardPickerOpen, setIsCardPickerOpen] = useState(false)

  // 편집 모드 열기/닫기
  const enterEditMode = useCallback(() => {
    setIsEditing(true)
  }, [])

  const exitEditMode = useCallback(() => {
    setIsEditing(false)
  }, [])

  // 카드 선택 모달 열기/닫기
  const openCardPicker = useCallback(() => {
    setIsEditing(true)
    setIsCardPickerOpen(true)
  }, [])

  const closeCardPicker = useCallback(() => {
    setIsCardPickerOpen(false)
  }, [])

  // 선택 카드 추가
  const addPickedCard = useCallback(
    (cardId: SummaryCardId) => {
      addCard(cardId)
      setIsCardPickerOpen(false)
    },
    [addCard],
  )

  return {
    isEditing,
    isCardPickerOpen,
    enterEditMode,
    exitEditMode,
    openCardPicker,
    closeCardPicker,
    addPickedCard,
  }
}
