import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { formatDateWithDay } from "@/shared/lib/format"
import { useNotificationPermissionRequestDone } from "@/shared/lib/notificationPermissionRequest"
import { Main } from "@/shared/ui/Main"
import { useSummaryCardLayout } from "../model/useSummaryCardLayout"
import { useSummaryEditing } from "../model/useSummaryEditing"
import { useSummaryCardData } from "../model/useSummaryCardData"
import { useWeeklyRoutineFeaturePrompt } from "../model/useWeeklyRoutineFeaturePrompt"
import { SummaryCardRows } from "./SummaryCardRows"
import { SummaryHiddenCardPicker } from "./SummaryHiddenCardPicker"
import { SummaryEditControls } from "./SummaryEditControls"
import { WeeklyRoutineSettingsSheet } from "./WeeklyRoutineSettingsSheet"
import { WeeklyRoutineSetupPromptModal } from "./WeeklyRoutineSetupPromptModal"

export function SummaryScreen() {
  const cardData = useSummaryCardData()
  const { t } = cardData
  const insets = useSafeAreaInsets()
  const notificationPermissionRequestDone =
    useNotificationPermissionRequestDone()
  const {
    cardRows,
    availableCards,
    addCard,
    removeCard,
    moveCard,
    moveCardWithinRow,
  } = useSummaryCardLayout()
  const {
    isEditing,
    isCardPickerOpen,
    enterEditMode,
    exitEditMode,
    openCardPicker,
    closeCardPicker,
    addPickedCard,
  } = useSummaryEditing(addCard)

  const todayDate = new Date()
  const dateString = formatDateWithDay(todayDate)
  const weeklyRoutinePlan = cardData.weeklyRoutinePlan
  const {
    isFeatureAlertOpen,
    isSettingsOpen,
    closeSettings,
    handleRoutineTogglePress,
  } = useWeeklyRoutineFeaturePrompt({
    notificationPermissionRequestDone,
    weeklyRoutinePlan,
    t,
  })
  const routineToggleLabel = weeklyRoutinePlan.isRoutineEnabled
    ? t("summary.routineOn")
    : t("summary.routineOff")
  const hiddenCardIds = availableCards
    .filter((card) => !card.isVisible)
    .map((card) => card.id)

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
        {isEditing ? (
          <View className="pt-yb-4 pb-yb-6">
            <View className="h-yb-12" />
          </View>
        ) : (
          <>
            {/* 헤더 */}
            <View className="flex-row items-center justify-between gap-yb-3 pt-yb-4 pb-yb-1">
              <Text className="shrink text-yb-fg text-yb-display tracking-yb-tight">
                {t("summary.title")}
              </Text>
              <Pressable
                disabled={weeklyRoutinePlan.isLoading}
                className={`h-yb-9 justify-center rounded-yb-md bg-yb-fill-pale px-yb-4 ${
                  weeklyRoutinePlan.isLoading ? "opacity-50" : ""
                }`}
                onPress={handleRoutineTogglePress}
              >
                <Text className="text-yb-body-sm font-semibold text-yb-fg-secondary">
                  {routineToggleLabel}
                </Text>
              </Pressable>
            </View>
            <Text className="mb-yb-6 text-yb-label text-yb-fg-secondary">
              {dateString}
            </Text>
          </>
        )}

        {cardRows.length === 0 && (
          <Pressable
            accessibilityLabel={t("summary.add")}
            className="mb-yb-4 rounded-yb-xl border border-yb-border bg-yb-surface/70 p-yb-6 active:opacity-80"
            onPress={openCardPicker}
            onLongPress={enterEditMode}
            delayLongPress={450}
          >
            <Text className="text-center text-yb-body-md font-semibold text-yb-fg-secondary">
              {t("summary.noCards", {
                defaultValue: "표시 중인 카드가 없습니다.",
              })}
            </Text>
          </Pressable>
        )}

        <SummaryCardRows
          cardRows={cardRows}
          cardData={cardData}
          isEditing={isEditing}
          onCardLongPress={enterEditMode}
          onDragCard={moveCard}
          onMoveCardWithinRow={moveCardWithinRow}
          onRemoveCard={removeCard}
        />
      </ScrollView>

      {isEditing && (
        <SummaryEditControls
          addLabel={t("summary.add")}
          doneLabel={t("summary.done", { defaultValue: "완료" })}
          topOffset={insets.top + 12}
          onAdd={openCardPicker}
          onDone={exitEditMode}
        />
      )}

      <SummaryHiddenCardPicker
        cards={hiddenCardIds}
        cardData={cardData}
        visible={isCardPickerOpen}
        onAddCard={addPickedCard}
        onClose={closeCardPicker}
      />
      <WeeklyRoutineSettingsSheet
        plan={weeklyRoutinePlan}
        visible={isSettingsOpen}
        onClose={closeSettings}
      />
      <WeeklyRoutineSetupPromptModal
        plan={weeklyRoutinePlan}
        visible={
          weeklyRoutinePlan.isRoutineEnabled &&
          Boolean(weeklyRoutinePlan.setupPromptKind) &&
          !weeklyRoutinePlan.isLoading &&
          !isSettingsOpen &&
          !isFeatureAlertOpen
        }
      />
    </Main>
  )
}
