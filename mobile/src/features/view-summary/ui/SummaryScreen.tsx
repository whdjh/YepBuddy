import { useCallback, useRef } from "react"
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  clearPendingWorkoutPlaceReminderPrompt,
  getPendingWorkoutPlaceReminderPrompt,
  useWorkout,
} from "@/entities/workout-session"
import { formatDateWithDay } from "@/shared/lib/format"
import { openWebUrl, privacyPolicyUrl, supportUrl } from "@/shared/lib/legalLinks"
import { useNotificationPermissionRequestDone } from "@/shared/lib/notificationPermissionRequest"
import { Main } from "@/shared/ui/Main"
import { useSummaryCardLayout } from "../model/useSummaryCardLayout"
import { useSummaryEditing } from "../model/useSummaryEditing"
import { useSummaryCardData } from "../model/useSummaryCardData"
import { useWeeklyRoutineFeaturePrompt } from "../model/useWeeklyRoutineFeaturePrompt"
import { SummaryCardRows } from "./SummaryCardRows"
import { SummaryHiddenCardPicker } from "./SummaryHiddenCardPicker"
import { SummaryEditControls } from "./SummaryEditControls"
import { WeeklyRoutineSetupPromptModal } from "./WeeklyRoutineSetupPromptModal"

const SUMMARY_BACKGROUND_COLORS = {
  light: ["#FAF7F2", "#FAF7F2"],
  dark: ["#1C1C1E", "#1C1C1E"],
} as const

export function SummaryScreen() {
  const cardData = useSummaryCardData()
  const { t } = cardData
  const { state } = useWorkout()
  const isDark = useColorScheme() === "dark"
  const insets = useSafeAreaInsets()
  const isPlaceReminderAlertOpenRef = useRef(false)
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
  const { isFeatureAlertOpen } = useWeeklyRoutineFeaturePrompt({
    notificationPermissionRequestDone,
    weeklyRoutinePlan,
    t,
  })
  const hiddenCardIds = availableCards
    .filter((card) => !card.isVisible)
    .map((card) => card.id)
  const hasLegalLinks = Boolean(privacyPolicyUrl || supportUrl)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false

      void getPendingWorkoutPlaceReminderPrompt().then((prompt) => {
        if (cancelled || !prompt || isPlaceReminderAlertOpenRef.current) {
          return
        }

        isPlaceReminderAlertOpenRef.current = true
        Alert.alert(
          t("workoutPlaceReminder.prompt.title"),
          t("workoutPlaceReminder.prompt.body"),
          [
            {
              text: t("workoutPlaceReminder.prompt.later"),
              style: "cancel",
              onPress: () => {
                void clearPendingWorkoutPlaceReminderPrompt()
                isPlaceReminderAlertOpenRef.current = false
              },
            },
            {
              text: t("workoutPlaceReminder.prompt.start"),
              onPress: () => {
                void clearPendingWorkoutPlaceReminderPrompt()
                isPlaceReminderAlertOpenRef.current = false
                if (state.phase === "recording" || state.phase === "paused") {
                  router.push("/workout/active")
                  return
                }
                router.push("/workout/countdown")
              },
            },
          ],
          { cancelable: false },
        )
      })

      return () => {
        cancelled = true
      }
    }, [state.phase, t]),
  )

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
            <View className="pt-yb-4 pb-yb-1 pr-yb-12">
              <Text className="shrink text-yb-fg text-yb-display tracking-yb-tight">
                {t("summary.title")}
              </Text>
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
              {t("summary.noCards")}
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
                  void openWebUrl(privacyPolicyUrl)
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
                  void openWebUrl(supportUrl)
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
          doneLabel={t("summary.done")}
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
      <WeeklyRoutineSetupPromptModal
        plan={weeklyRoutinePlan}
        visible={
          weeklyRoutinePlan.isRoutineEnabled &&
          Boolean(weeklyRoutinePlan.setupPromptKind) &&
          !weeklyRoutinePlan.isLoading &&
          !isFeatureAlertOpen
        }
      />
    </Main>
  )
}
