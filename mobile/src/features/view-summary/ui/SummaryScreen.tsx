import {
  Pressable,
  Linking,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { formatDateWithDay } from "@/shared/lib/format"
import { privacyPolicyUrl, supportUrl } from "@/shared/lib/legalLinks"
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

const SUMMARY_BACKGROUND_COLORS = {
  light: ["#FAF7F2", "#FAF7F2"],
  dark: ["#1C1C1E", "#1C1C1E"],
} as const

export function SummaryScreen() {
  const cardData = useSummaryCardData()
  const { t } = cardData
  const isDark = useColorScheme() === "dark"
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
  const hasLegalLinks = Boolean(privacyPolicyUrl || supportUrl)

  return (
    <Main>
      <LinearGradient
        colors={
          isDark
            ? SUMMARY_BACKGROUND_COLORS.dark
            : SUMMARY_BACKGROUND_COLORS.light
        }
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

        {!isEditing && hasLegalLinks && (
          <View
            accessibilityLabel={t("legal.footerLabel")}
            className="mt-yb-6 flex-row flex-wrap items-center justify-center gap-yb-2"
          >
            {privacyPolicyUrl && (
              <Pressable
                className="min-h-[36px] justify-center px-yb-2 active:opacity-70"
                onPress={() => {
                  void Linking.openURL(privacyPolicyUrl)
                }}
              >
                <Text className="text-yb-caption font-semibold text-yb-fg-secondary">
                  {t("legal.privacyPolicy")}
                </Text>
              </Pressable>
            )}
            {privacyPolicyUrl && supportUrl && (
              <Text className="text-yb-caption text-yb-fg-tertiary">/</Text>
            )}
            {supportUrl && (
              <Pressable
                className="min-h-[36px] justify-center px-yb-2 active:opacity-70"
                onPress={() => {
                  void Linking.openURL(supportUrl)
                }}
              >
                <Text className="text-yb-caption font-semibold text-yb-fg-secondary">
                  {t("legal.support")}
                </Text>
              </Pressable>
            )}
          </View>
        )}
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
