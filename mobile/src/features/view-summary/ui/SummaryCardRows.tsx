import { View } from "react-native"
import type { useSummaryCardData } from "../model/useSummaryCardData"
import {
  getSummaryCardWidth,
  type SummaryCardId,
  type SummaryCardVisualDirection,
} from "../model/summaryCardLayout"
import { EditableSummaryCardFrame } from "./EditableSummaryCardFrame"
import { SummaryCardRenderer } from "./SummaryCardRenderer"

type SummaryCardData = ReturnType<typeof useSummaryCardData>

interface SummaryCardRowsProps {
  cardRows: SummaryCardId[][]
  cardData: SummaryCardData
  isEditing: boolean
  onCardLongPress: () => void
  onMoveCard: (
    cardId: SummaryCardId,
    direction: SummaryCardVisualDirection,
    steps?: number,
  ) => void
  onRemoveCard: (cardId: SummaryCardId) => void
}

export function SummaryCardRows({
  cardRows,
  cardData,
  isEditing,
  onCardLongPress,
  onMoveCard,
  onRemoveCard,
}: SummaryCardRowsProps) {
  return (
    <>
      {cardRows.map((row) => (
        <SummaryCardRow
          key={row.join(":")}
          row={row}
          cardData={cardData}
          isEditing={isEditing}
          onCardLongPress={onCardLongPress}
          onMoveCard={onMoveCard}
          onRemoveCard={onRemoveCard}
        />
      ))}
    </>
  )
}

interface SummaryCardRowProps
  extends Omit<SummaryCardRowsProps, "cardRows"> {
  row: SummaryCardId[]
}

function SummaryCardRow({
  row,
  cardData,
  isEditing,
  onCardLongPress,
  onMoveCard,
  onRemoveCard,
}: SummaryCardRowProps) {
  const isHalfRow =
    row.length > 1 || getSummaryCardWidth(row[0]) === "half"

  return (
    <View className={`${isHalfRow ? "flex-row gap-yb-4" : ""} mb-yb-4`}>
      {row.map((cardId) => (
        <View
          key={cardId}
          className={isHalfRow ? "basis-0 grow" : undefined}
        >
          <EditableSummaryCard
            cardId={cardId}
            cardData={cardData}
            isEditing={isEditing}
            onCardLongPress={onCardLongPress}
            onMoveCard={onMoveCard}
            onRemoveCard={onRemoveCard}
          />
        </View>
      ))}
      {isHalfRow && row.length === 1 && <View className="basis-0 grow" />}
    </View>
  )
}

interface EditableSummaryCardProps
  extends Omit<SummaryCardRowsProps, "cardRows"> {
  cardId: SummaryCardId
}

function EditableSummaryCard({
  cardId,
  cardData,
  isEditing,
  onCardLongPress,
  onMoveCard,
  onRemoveCard,
}: EditableSummaryCardProps) {
  return (
    <EditableSummaryCardFrame
      isEditing={isEditing}
      onMove={(direction, steps) => onMoveCard(cardId, direction, steps)}
      onRemove={() => onRemoveCard(cardId)}
    >
      <SummaryCardRenderer
        cardId={cardId}
        data={cardData}
        onLongPress={onCardLongPress}
      />
    </EditableSummaryCardFrame>
  )
}
