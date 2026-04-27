import { SymbolView } from "expo-symbols"
import type { ReactNode } from "react"
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native"
import { useTranslation } from "react-i18next"
import {
  buildSummaryCardRows,
  getSummaryCardWidth,
  type SummaryCardId,
} from "../model/summaryCardLayout"

interface SummaryCardEditModalProps {
  visible: boolean
  cards: SummaryCardId[]
  renderCardPreview: (cardId: SummaryCardId) => ReactNode
  onAddCard: (cardId: SummaryCardId) => void
  onClose: () => void
}

export function SummaryCardEditModal({
  visible,
  cards,
  renderCardPreview,
  onAddCard,
  onClose,
}: SummaryCardEditModalProps) {
  const { t } = useTranslation()

  const isDark = useColorScheme() === "dark"
  const iconColor = isDark ? "#F8E7D0" : "#5B4126"

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="absolute inset-0 justify-end bg-black/35">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="rounded-t-yb-xl border border-yb-border bg-yb-surface px-yb-5 pb-yb-8 pt-yb-5">
          <View className="mb-yb-4 flex-row items-center justify-between">
            <Text className="text-yb-title font-bold text-yb-fg">
              {t("summary.editSummary")}
            </Text>
            <Pressable
              accessibilityLabel={t("summary.done")}
              className="h-10 w-10 items-center justify-center rounded-full bg-yb-fill-pale"
              onPress={onClose}
            >
              <SymbolView name="xmark" size={16} tintColor={iconColor} />
            </Pressable>
          </View>

          {cards.length === 0 ? (
            <View className="rounded-yb-xl border border-yb-border bg-yb-surface-subtle p-yb-6">
              <Text className="text-center text-yb-body-md font-semibold text-yb-fg-secondary">
                {t("summary.noAvailableCards")}
              </Text>
            </View>
          ) : (
            <ScrollView
              className="max-h-[560px]"
              contentContainerClassName="gap-yb-4 pb-yb-2"
              showsVerticalScrollIndicator={false}
            >
              {buildSummaryCardRows(cards).map((row) => {
                const isHalfRow =
                  row.length > 1 || getSummaryCardWidth(row[0]) === "half"

                return (
                  <View
                    key={row.join(":")}
                    className={isHalfRow ? "flex-row gap-yb-4" : ""}
                  >
                    {row.map((cardId) => (
                      <Pressable
                        key={cardId}
                        accessibilityLabel={t("summary.add")}
                        className={isHalfRow ? "basis-0 grow" : undefined}
                        onPress={() => onAddCard(cardId)}
                      >
                        <View pointerEvents="none">{renderCardPreview(cardId)}</View>
                      </Pressable>
                    ))}
                    {isHalfRow && row.length === 1 && <View className="basis-0 grow" />}
                  </View>
                )
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  )
}
