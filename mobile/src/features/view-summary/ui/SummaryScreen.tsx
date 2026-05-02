import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { formatDateWithDay } from "@/shared/lib/format"
import { useNotificationPermissionRequestDone } from "@/shared/lib/notificationPermissionRequest"
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

const IS_LIQUID_GLASS_AVAILABLE = isLiquidGlassAvailable()

export function SummaryScreen() {
  const cardData = useSummaryCardData()
  const { t } = cardData
  const insets = useSafeAreaInsets()
  const notificationPermissionRequestDone =
    useNotificationPermissionRequestDone()
  const [isEditing, setIsEditing] = useState(false)
  const [isCardPickerOpen, setIsCardPickerOpen] = useState(false)
  const [isWeeklyRoutineFeatureAlertOpen, setIsWeeklyRoutineFeatureAlertOpen] =
    useState(false)
  const [isWeeklyRoutineSettingsOpen, setIsWeeklyRoutineSettingsOpen] =
    useState(false)
  const isWeeklyRoutineFeatureAlertOpenRef = useRef(false)
  const {
    cardRows,
    availableCards,
    addCard,
    removeCard,
    moveCard,
    moveCardWithinRow,
  } = useSummaryCardLayout()

  const todayDate = new Date()
  const dateString = formatDateWithDay(todayDate)
  const weeklyRoutinePlan = cardData.weeklyRoutinePlan
  const shouldShowRoutineFeatureAlert =
    notificationPermissionRequestDone &&
    weeklyRoutinePlan.featureStatus === "unasked" &&
    !weeklyRoutinePlan.isLoading &&
    !isWeeklyRoutineSettingsOpen
  const routineToggleLabel = weeklyRoutinePlan.isRoutineEnabled
    ? t("summary.routineOn")
    : t("summary.routineOff")
  const hiddenCardIds = availableCards
    .filter((card) => !card.isVisible)
    .map((card) => card.id)
  const enterEditMode = () => setIsEditing(true)
  const openCardPicker = () => {
    setIsEditing(true)
    setIsCardPickerOpen(true)
  }

  const closeRoutineFeatureAlert = useCallback(() => {
    isWeeklyRoutineFeatureAlertOpenRef.current = false
    setIsWeeklyRoutineFeatureAlertOpen(false)
  }, [])

  const showRoutineFeatureAlert = useCallback(() => {
    if (isWeeklyRoutineFeatureAlertOpenRef.current) {
      return
    }

    isWeeklyRoutineFeatureAlertOpenRef.current = true
    setIsWeeklyRoutineFeatureAlertOpen(true)
    Alert.alert(
      t("workout.weeklyRoutine.featurePrompt.title"),
      undefined,
      [
        {
          text: t("workout.weeklyRoutine.featurePrompt.decline"),
          style: "cancel",
          onPress: () => {
            void weeklyRoutinePlan.disableRoutine().finally(() => {
              closeRoutineFeatureAlert()
            })
          },
        },
        {
          text: t("workout.weeklyRoutine.featurePrompt.accept"),
          onPress: () => {
            closeRoutineFeatureAlert()
            setIsWeeklyRoutineSettingsOpen(true)
          },
        },
      ],
      { cancelable: false },
    )
  }, [closeRoutineFeatureAlert, t, weeklyRoutinePlan])

  useEffect(() => {
    if (shouldShowRoutineFeatureAlert) {
      showRoutineFeatureAlert()
    }
  }, [shouldShowRoutineFeatureAlert, showRoutineFeatureAlert])

  const handleRoutineTogglePress = () => {
    if (weeklyRoutinePlan.isRoutineEnabled) {
      void weeklyRoutinePlan.disableRoutine()
      return
    }

    showRoutineFeatureAlert()
  }

  function renderEditableSummaryCard(cardId: SummaryCardId) {
    return (
      <EditableSummaryCardFrame
        key={cardId}
        isEditing={isEditing}
        onDrag={(direction) => moveCard(cardId, direction)}
        onMoveWithinRow={(direction) => moveCardWithinRow(cardId, direction)}
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

      {isEditing && (
        <SummaryEditControls
          addLabel={t("summary.add")}
          doneLabel={t("summary.done", { defaultValue: "완료" })}
          topOffset={insets.top + 12}
          onAdd={openCardPicker}
          onDone={() => setIsEditing(false)}
        />
      )}

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
        plan={weeklyRoutinePlan}
        visible={isWeeklyRoutineSettingsOpen}
        onClose={() => setIsWeeklyRoutineSettingsOpen(false)}
      />
      <WeeklyRoutineSetupPromptModal
        plan={weeklyRoutinePlan}
        visible={
          weeklyRoutinePlan.isRoutineEnabled &&
          Boolean(weeklyRoutinePlan.setupPromptKind) &&
          !weeklyRoutinePlan.isLoading &&
          !isWeeklyRoutineSettingsOpen &&
          !isWeeklyRoutineFeatureAlertOpen
        }
      />
    </Main>
  )
}

interface SummaryEditControlsProps {
  addLabel: string
  doneLabel: string
  topOffset: number
  onAdd: () => void
  onDone: () => void
}

function SummaryEditControls({
  addLabel,
  doneLabel,
  topOffset,
  onAdd,
  onDone,
}: SummaryEditControlsProps) {
  const isDark = useColorScheme() === "dark"
  const plusTintColor = isDark ? "#FFFFFF" : "#FAF7F2"
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withSpring(1, { damping: 18, stiffness: 260 })
  }, [progress])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: (1 - progress.value) * -8 },
      { scale: 0.92 + progress.value * 0.08 },
    ],
  }))

  return (
    <Animated.View
      pointerEvents="box-none"
      className="absolute left-yb-5 right-yb-5 z-20 flex-row items-center justify-between"
      style={[animatedStyle, { top: topOffset }]}
    >
      <Pressable
        accessibilityLabel={addLabel}
        className={`h-yb-12 w-yb-12 items-center justify-center rounded-full shadow-yb-sm active:scale-95 ${
          isDark
            ? "border border-yb-border bg-yb-surface-subtle"
            : "bg-yb-fill-strong"
        }`}
        onPress={onAdd}
      >
        <SymbolView name="plus" size={24} tintColor={plusTintColor} />
      </Pressable>
      <Pressable
        accessibilityLabel={doneLabel}
        className="h-yb-12 w-yb-12 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/20 shadow-yb-sm active:scale-95 dark:border-white/20 dark:bg-white/10"
        onPress={onDone}
      >
        <GlassCircleBackground isDark={isDark} />
        <SymbolView
          name="checkmark"
          size={24}
          tintColor={isDark ? "#D6FAD6" : "#17501D"}
        />
      </Pressable>
    </Animated.View>
  )
}

function GlassCircleBackground({ isDark }: { isDark: boolean }) {
  if (IS_LIQUID_GLASS_AVAILABLE) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        colorScheme={isDark ? "dark" : "light"}
        tintColor={isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.34)"}
        className="absolute inset-0"
        pointerEvents="none"
        style={{ bottom: 0, left: 0, position: "absolute", right: 0, top: 0 }}
      />
    )
  }

  return (
    <View
      className={`absolute inset-0 ${
        isDark ? "bg-white/10" : "bg-white/35"
      }`}
      pointerEvents="none"
    />
  )
}
