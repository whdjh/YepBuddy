import type { useSummaryCardData } from "../model/useSummaryCardData"
import type { SummaryCardId } from "../model/summaryCardLayout"
import { SummaryCardEditModal } from "./SummaryCardEditModal"
import { SummaryCardRenderer } from "./SummaryCardRenderer"

type SummaryCardData = ReturnType<typeof useSummaryCardData>

interface SummaryHiddenCardPickerProps {
  cards: SummaryCardId[]
  cardData: SummaryCardData
  visible: boolean
  onAddCard: (cardId: SummaryCardId) => void
  onClose: () => void
}

export function SummaryHiddenCardPicker({
  cards,
  cardData,
  visible,
  onAddCard,
  onClose,
}: SummaryHiddenCardPickerProps) {
  return (
    <SummaryCardEditModal
      cards={cards}
      renderCardPreview={(cardId) => (
        <SummaryCardRenderer
          cardId={cardId}
          data={cardData}
          onLongPress={() => {}}
        />
      )}
      visible={visible}
      onAddCard={onAddCard}
      onClose={onClose}
    />
  )
}
