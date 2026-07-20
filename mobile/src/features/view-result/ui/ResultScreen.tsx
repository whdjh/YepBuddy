import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  appendCardioDurationToTitle,
  deleteStoredWorkoutSession,
  deleteWorkoutCalendarEvent,
  formatWorkoutLocationCoordinates,
  formatWorkoutLocationLabel,
  getCardioDurationMinutes,
  getStoredWorkoutSessionDurationSeconds,
  getWorkoutSessionDetailActiveKcal,
  getWorkoutBodyPartSetLabel,
  updateStoredWorkoutMemo,
  updateStoredWorkoutSetCounts,
  updateWorkoutCalendarEvent,
  type WorkoutSetCountUpdate,
} from "@/entities/workout-session"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SymbolView } from "@/shared/ui/SymbolView"
import { Main } from "@/shared/ui/Main"
import { GlassTextarea } from "@/shared/ui/GlassTextarea"
import { IconButton } from "@/shared/ui/IconButton"
import { SessionHeader } from "./SessionHeader"
import { StatsGrid } from "./StatsGrid"
import { HeartRateChart } from "./HeartRateChart"
import { LocationMap } from "./LocationMap"
import { SetCountEditSheet } from "./SetCountEditSheet"
import { resolveResultAverageHeartRate } from "../model/averageHeartRate"
import {
  bodyPartLabel,
  bodyPartDetailLabel,
  formatDateWithDay,
  formatDuration,
  formatTime,
} from "@/shared/lib/format"
import { useSessionDetail } from "../model/useSessionDetail"

interface ResultScreenProps {
  sessionId: string
  fromWorkout?: boolean
}

export function ResultScreen({
  sessionId,
  fromWorkout = false,
}: ResultScreenProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { accent: accentColor, fg: fgColor } = useCardColors()
  const deleteColor = useResolvedColorToken(semanticColorTokens.statusError)
  const { data, isLoading, reload } = useSessionDetail(sessionId)
  const stored = data?.stored
  const hk = data?.hk
  const [memo, setMemo] = useState(stored?.memo ?? "")
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSetCountSheetVisible, setIsSetCountSheetVisible] = useState(false)
  const [isSavingSetCounts, setIsSavingSetCounts] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const memoSavePromiseRef = useRef<
    ReturnType<typeof updateStoredWorkoutMemo> | null
  >(null)

  useEffect(() => {
    setMemo(stored?.memo ?? "")
  }, [sessionId, stored?.memo])

  useEffect(() => {
    let cancelled = false

    if (!stored?.location) {
      setLocationLabel(null)
      return
    }

    const fallback = formatWorkoutLocationCoordinates(stored.location)
    setLocationLabel(fallback)

    void formatWorkoutLocationLabel(stored.location).then((label) => {
      if (!cancelled) {
        setLocationLabel(label)
      }
    })

    return () => {
      cancelled = true
    }
  }, [stored?.location])

  useEffect(() => {
    const initialMemo = stored?.memo ?? ""

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    if (isDeleting || !sessionId || memo === initialMemo) {
      return
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null
      const savePromise = (memoSavePromiseRef.current ?? Promise.resolve())
        .catch(() => undefined)
        .then(() => updateStoredWorkoutMemo(sessionId, memo))
      memoSavePromiseRef.current = savePromise
      void savePromise.catch(() => undefined)
    }, 300)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
    }
  }, [isDeleting, memo, sessionId, stored?.memo])

  const dateLabel = stored?.startedAt
    ? formatDateWithDay(new Date(stored.startedAt))
    : t("workout.result.noData")
  const bodyPartTitleBase =
    stored?.bodyParts && stored.bodyParts.length > 0
      ? stored.bodyParts
          .map((item) =>
            getWorkoutBodyPartSetLabel(item, {
              bodyPartLabel,
              bodyPartDetailLabel,
            }),
          )
          .join(", ")
      : t("workout.result.unspecified")
  const representativeBodyPart = stored?.bodyParts[0]?.part ?? null
  const startTime = stored?.startedAt ? formatTime(stored.startedAt) : "--"
  const endTime = stored?.completedAt ? formatTime(stored.completedAt) : "--"
  const totalSets =
    stored?.bodyParts.reduce((sum, item) => sum + item.setCount, 0) ?? 0
  const cardioDurationMinutes = stored?.completedAt
    ? getCardioDurationMinutes({
        cardioStartedAt: stored.cardioStartedAt,
        completedAt: stored.completedAt,
      })
    : null
  const bodyPartTitle = appendCardioDurationToTitle({
    title: bodyPartTitleBase,
    cardioLabel: t("workout.calendar.cardio"),
    cardioMinutes: cardioDurationMinutes,
  })
  const avgHeartRate = resolveResultAverageHeartRate({
    storedAverageHeartRate: stored?.averageHeartRate ?? null,
    healthKitAverageHeartRate: hk?.averageHeartRate ?? null,
    heartRateSamples: hk?.heartRateSamples ?? [],
  })
  const chartData =
    hk?.heartRateSamples.map((item, index) => ({
      bpm: item.bpm,
      time: index,
    })) ?? []
  const chartStartTimeLabel =
    hk?.heartRateSamples && hk.heartRateSamples.length > 0
      ? formatTime(hk.heartRateSamples[0].startDate)
      : startTime
  const chartEndTimeLabel =
    hk?.heartRateSamples && hk.heartRateSamples.length > 0
      ? formatTime(hk.heartRateSamples[hk.heartRateSamples.length - 1].endDate)
      : endTime

  const flushPendingMemo = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    if (!stored) {
      return null
    }

    const savePromise = (memoSavePromiseRef.current ?? Promise.resolve())
      .catch(() => undefined)
      .then(() => updateStoredWorkoutMemo(sessionId, memo))
    memoSavePromiseRef.current = savePromise
    return savePromise
  }

  const deleteLocalSession = async () => {
    setIsDeleting(true)

    try {
      await deleteStoredWorkoutSession(sessionId)
      router.replace("/")
    } catch {
      Alert.alert(
        t("workout.result.deleteErrorTitle"),
        t("workout.result.deleteErrorMessage"),
      )
      setIsDeleting(false)
    }
  }

  const confirmLocalOnlyDelete = () => {
    Alert.alert(
      t("workout.result.calendarDeleteErrorTitle"),
      t("workout.result.calendarDeleteErrorMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
          onPress: () => setIsDeleting(false),
        },
        {
          text: t("workout.result.deleteAppOnly"),
          style: "destructive",
          onPress: () => void deleteLocalSession(),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => setIsDeleting(false),
      },
    )
  }

  const deleteSession = async () => {
    if (!stored) {
      return
    }

    setIsDeleting(true)
    const sessionToDelete = await flushPendingMemo().catch(() => stored)

    const calendarStatus = await deleteWorkoutCalendarEvent(
      sessionToDelete ?? stored,
    )

    if (calendarStatus === "deleted" || calendarStatus === "notFound") {
      await deleteLocalSession()
      return
    }

    confirmLocalOnlyDelete()
  }

  const handleSetCountSave = async (updates: WorkoutSetCountUpdate[]) => {
    if (!stored || isDeleting || isSavingSetCounts) {
      return
    }

    setIsSavingSetCounts(true)

    try {
      const previousSession = await memoSavePromiseRef.current
      if (!previousSession) {
        throw new Error("Memo save must finish before set count update")
      }
      const nextSession = await updateStoredWorkoutSetCounts(sessionId, updates)

      if (!nextSession) {
        setIsSetCountSheetVisible(false)
        await reload()
        Alert.alert(
          t("workout.result.editSetsErrorTitle"),
          t("workout.result.editSetsErrorMessage"),
        )
        return
      }

      const calendarStatus = await updateWorkoutCalendarEvent(
        nextSession,
        previousSession,
      )

      await reload()
      setIsSetCountSheetVisible(false)

      if (
        calendarStatus === "permissionDenied" ||
        calendarStatus === "failed"
      ) {
        Alert.alert(
          t("workout.result.calendarUpdateErrorTitle"),
          t("workout.result.calendarUpdateErrorMessage"),
        )
      }
    } catch {
      Alert.alert(
        t("workout.result.editSetsErrorTitle"),
        t("workout.result.editSetsErrorMessage"),
      )
    } finally {
      setIsSavingSetCounts(false)
    }
  }

  const handleEditPress = () => {
    if (!stored?.bodyParts.length || isDeleting || isSavingSetCounts) {
      return
    }

    void flushPendingMemo().catch(() => undefined)
    setIsSetCountSheetVisible(true)
  }

  const handleDeletePress = () => {
    if (!stored || isDeleting || isSavingSetCounts) {
      return
    }

    Alert.alert(
      t("workout.result.deleteTitle"),
      t("workout.result.deleteMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("workout.result.deleteConfirmYes"),
          style: "destructive",
          onPress: () => void deleteSession(),
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <Main>
      {/* 네비게이션 */}
      <View className="flex-row items-center gap-yb-3 px-yb-5 pb-yb-4 pt-yb-2">
        <IconButton
          accessibilityLabel={t("common.back")}
          variant="back-square"
          onPress={() => (fromWorkout ? router.replace("/") : router.back())}
        >
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text
          className="min-w-0 shrink grow text-yb-title text-yb-fg"
          numberOfLines={1}
        >
          {dateLabel}
        </Text>
        {stored ? (
          <View className="flex-row gap-yb-2">
            {stored.bodyParts.length > 0 && (
              <IconButton
                accessibilityLabel={t("workout.result.editSets")}
                accessibilityState={{
                  disabled: isDeleting || isSavingSetCounts,
                }}
                disabled={isDeleting || isSavingSetCounts}
                variant="back-square"
                onPress={handleEditPress}
              >
                <SymbolView name="pencil" size={18} tintColor={accentColor} />
              </IconButton>
            )}
            <IconButton
              accessibilityLabel={t("workout.result.deleteConfirm")}
              accessibilityState={{ busy: isDeleting, disabled: isDeleting }}
              disabled={isDeleting}
              variant="back-square"
              onPress={handleDeletePress}
            >
              <SymbolView name="trash" size={19} tintColor={deleteColor} />
            </IconButton>
          </View>
        ) : (
          <View className="w-yb-icon-btn" />
        )}
      </View>

      {isLoading ? (
        <View className="grow items-center justify-center px-yb-5">
          <ActivityIndicator color={fgColor} />
        </View>
      ) : !stored ? (
        <View className="grow items-center justify-center px-yb-5">
          <Text className="text-yb-heading-sm text-yb-fg">
            {t("workout.result.noData")}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="grow"
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom, 18) + 32,
          }}
          contentContainerClassName="px-yb-5"
          showsVerticalScrollIndicator={false}
        >
          {/* 세션 헤더 */}
          <SessionHeader
            bodyPartLabel={bodyPartTitle}
            representativeBodyPart={representativeBodyPart}
            startTime={startTime}
            endTime={endTime}
            location={locationLabel}
            isDeload={stored.isDeload === true}
          />

          {/* 메모 */}
          <View className="mt-yb-6">
            <GlassTextarea
              key={sessionId}
              placeholder={t("workout.result.memoPlaceholder")}
              value={memo}
              editable={!isDeleting}
              onChangeText={setMemo}
            />
          </View>

          {/* 운동세부사항 */}
          <Text className="mb-yb-3 mt-yb-8 text-yb-heading-sm text-yb-fg">
            {t("workout.result.statsTitle")}
          </Text>
          <StatsGrid
            duration={
              hk?.duration != null
                ? formatDuration(hk.duration)
                : stored
                  ? formatDuration(
                      getStoredWorkoutSessionDurationSeconds(stored),
                    )
                  : null
            }
            calories={getWorkoutSessionDetailActiveKcal({
              healthKitDetail: hk,
              storedSession: stored,
            })}
            totalSets={totalSets}
            avgHeartRate={avgHeartRate}
          />

          {/* 심박수 */}
          {chartData.length > 0 && (
            <>
              <Text className="mb-yb-3 mt-yb-8 text-yb-heading-sm text-yb-fg">
                {t("workout.result.heartRateChart")}
              </Text>
              <HeartRateChart
                data={chartData}
                avgBpm={avgHeartRate}
                startTimeLabel={chartStartTimeLabel}
                endTimeLabel={chartEndTimeLabel}
              />
            </>
          )}

          {/* Map */}
          {stored?.location && (
            <>
              <Text className="mb-yb-3 mt-yb-8 text-yb-heading-sm text-yb-fg">
                {t("workout.result.mapTitle")}
              </Text>
              <LocationMap
                latitude={stored.location.lat}
                longitude={stored.location.lng}
                locationName={
                  locationLabel ??
                  formatWorkoutLocationCoordinates(stored.location)
                }
              />
            </>
          )}
        </ScrollView>
      )}

      {stored && (
        <SetCountEditSheet
          bodyParts={stored.bodyParts}
          isSaving={isSavingSetCounts}
          visible={isSetCountSheetVisible}
          onClose={() => setIsSetCountSheetVisible(false)}
          onSave={(updates) => void handleSetCountSave(updates)}
        />
      )}
    </Main>
  )
}
