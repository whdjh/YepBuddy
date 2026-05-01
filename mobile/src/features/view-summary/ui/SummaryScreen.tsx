import { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { formatDateWithDay } from "@/shared/lib/format"
import { Main } from "@/shared/ui/Main"
import { useSummaryCardLayout } from "../model/useSummaryCardLayout"
import {
  getSummaryCardWidth,
  type SummaryCardId,
} from "../model/summaryCardLayout"
import { useSummaryCardData } from "../model/useSummaryCardData"
import { SummaryCardRenderer } from "./SummaryCardRenderer"
import { EditableSummaryCardFrame } from "./EditableSummaryCardFrame"
import { SummaryCardEditModal } from "./SummaryCardEditModal"
import { WeeklyRoutineSettingsSheet } from "./WeeklyRoutineSettingsSheet"
import { WeeklyRoutineSetupPromptModal } from "./WeeklyRoutineSetupPromptModal"

export function SummaryScreen() {
  const cardData = useSummaryCardData()
  const { t } = cardData
  const [isEditing, setIsEditing] = useState(false)
  const [isCardPickerOpen, setIsCardPickerOpen] = useState(false)
  const [isWeeklyRoutineSettingsOpen, setIsWeeklyRoutineSettingsOpen] =
    useState(false)
  const {
    cardRows,
    availableCards,
    addCard,
    removeCard,
    moveCard,
  } = useSummaryCardLayout()

  const todayDate = new Date()
  const dateString = formatDateWithDay(todayDate)
  const hiddenCardIds = availableCards
    .filter((card) => !card.isVisible)
    .map((card) => card.id)
  const enterEditMode = () => setIsEditing(true)

  function renderEditableSummaryCard(cardId: SummaryCardId) {
    return (
      <EditableSummaryCardFrame
        key={cardId}
        isEditing={isEditing}
        onDrag={(direction) => moveCard(cardId, direction)}
        onRemove={() => removeCard(cardId)}
      >
        <SummaryCardRenderer
          cardId={cardId}
          data={cardData}
          onLongPress={enterEditMode}
        />
      </EditableSummaryCardFrame>
    )
  }

  return (
    <Main>
      <LinearGradient
        colors={["#FAF7F2", "#EDE4D6", "#DDD2BF", "#EDE4D6", "#FAF7F2"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        className="absolute inset-0"
      />
      <ScrollView
        className="grow"
        contentContainerClassName="px-yb-5 pb-yb-30"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View className="flex-row items-center justify-between gap-yb-3 pt-yb-4 pb-yb-1">
          <Text className="shrink text-yb-fg text-yb-display tracking-yb-tight">
            {t("summary.title")}
          </Text>
          <View className="flex-row flex-wrap items-center justify-end gap-yb-2">
            {isEditing && (
              <Pressable
                className="h-yb-9 justify-center rounded-yb-md bg-yb-fill-pale px-yb-4"
                onPress={() => setIsEditing(false)}
              >
                <Text className="text-yb-body-sm font-semibold text-yb-fg-secondary">
                  {t("summary.done", { defaultValue: "완료" })}
                </Text>
              </Pressable>
            )}
            <Pressable
              className="h-yb-9 justify-center rounded-yb-md bg-yb-fill-pale px-yb-4"
              onPress={() => setIsWeeklyRoutineSettingsOpen(true)}
            >
              <Text className="text-yb-body-sm font-semibold text-yb-fg-secondary">
                {t("summary.routineSettings")}
              </Text>
            </Pressable>
            <Pressable
              className="h-yb-9 justify-center rounded-yb-md bg-yb-fill-pale px-yb-4"
              onPress={() => setIsCardPickerOpen(true)}
            >
              <Text className="text-yb-body-sm font-semibold text-yb-fg-secondary">
                {t("summary.editSummary")}
              </Text>
            </Pressable>
          </View>
        </View>
        <Text className="mb-yb-6 text-yb-label text-yb-fg-secondary">
          {dateString}
        </Text>

        {cardRows.length === 0 && (
          <View className="mb-yb-4 rounded-yb-xl border border-yb-border bg-yb-surface/70 p-yb-6">
            <Text className="text-center text-yb-body-md font-semibold text-yb-fg-secondary">
              {t("summary.noCards", {
                defaultValue: "표시 중인 카드가 없습니다.",
              })}
            </Text>
          </View>
        )}

        {cardRows.map((row) => {
          const rowKey = row.join(":")
          const isHalfRow =
            row.length > 1 || getSummaryCardWidth(row[0]) === "half"

          return (
            <View
              key={rowKey}
              className={`${isHalfRow ? "flex-row gap-yb-4" : ""} mb-yb-4`}
            >
              {row.map((cardId) => (
                <View
                  key={cardId}
                  className={isHalfRow ? "basis-0 grow" : undefined}
                >
                  {renderEditableSummaryCard(cardId)}
                </View>
              ))}
              {isHalfRow && row.length === 1 && <View className="basis-0 grow" />}
            </View>
          )
        })}
      </ScrollView>

      <SummaryCardEditModal
        cards={hiddenCardIds}
        renderCardPreview={(cardId) => (
          <SummaryCardRenderer
            cardId={cardId}
            data={cardData}
            onLongPress={() => {}}
          />
        )}
        visible={isCardPickerOpen}
        onAddCard={(cardId) => {
          addCard(cardId)
          setIsCardPickerOpen(false)
        }}
        onClose={() => setIsCardPickerOpen(false)}
      />
      <WeeklyRoutineSettingsSheet
        plan={cardData.weeklyRoutinePlan}
        visible={isWeeklyRoutineSettingsOpen}
        onClose={() => setIsWeeklyRoutineSettingsOpen(false)}
      />
      <WeeklyRoutineSetupPromptModal
        plan={cardData.weeklyRoutinePlan}
        visible={
          Boolean(cardData.weeklyRoutinePlan.setupPromptKind) &&
          !cardData.weeklyRoutinePlan.isLoading &&
          !isWeeklyRoutineSettingsOpen
        }
      />
    </Main>
  )
}
