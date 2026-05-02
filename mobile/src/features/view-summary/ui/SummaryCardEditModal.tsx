import type { ReactNode } from "react"
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import {
  GestureHandlerRootView,
  Pressable as GesturePressable,
} from "react-native-gesture-handler"
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

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <View className="absolute inset-0 justify-end bg-yb-result-delete-overlay">
          <GesturePressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <View className="z-10 rounded-t-yb-drawer border border-yb-border-subtle bg-yb-surface px-yb-5 pt-yb-3 shadow-yb-lg">
            <View className="mb-yb-5 h-yb-1 w-yb-12 self-center rounded-full bg-yb-border-subtle" />
            <Text className="mb-yb-5 text-yb-heading-sm text-yb-fg">
              {t("summary.editSummary")}
            </Text>

            {cards.length === 0 ? (
              <View className="py-yb-6">
                <Text className="text-center text-yb-body-md font-semibold text-yb-fg-secondary">
                  {t("summary.noAvailableCards")}
                </Text>
              </View>
            ) : (
              <ScrollView
                className="shrink"
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
                          className={
                            isHalfRow
                              ? "basis-0 grow active:opacity-85"
                              : "active:opacity-85"
                          }
                          onPress={() => onAddCard(cardId)}
                        >
                          <View pointerEvents="none">
                            {renderCardPreview(cardId)}
                          </View>
                        </Pressable>
                      ))}
                      {isHalfRow && row.length === 1 && (
                        <View className="basis-0 grow" />
                      )}
                    </View>
                  )
                })}
              </ScrollView>
            )}

            <Pressable
              accessibilityLabel={t("summary.done")}
              className="mb-yb-10 mt-yb-3 h-yb-btn-md items-center justify-center rounded-full bg-yb-accent px-yb-6 shadow-yb-md active:opacity-90"
              onPress={onClose}
            >
              <Text className="text-yb-body-lg text-yb-on-accent">
                {t("summary.done")}
              </Text>
            </Pressable>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}
