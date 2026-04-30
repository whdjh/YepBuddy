import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  deleteStoredWorkoutSession,
  getWorkoutBodyPartSetLabel,
  updateStoredWorkoutMemo,
} from "@/entities/workout-session"
import { Main } from "@/shared/ui/Main"
import { GlassTextarea } from "@/shared/ui/Input"
import { IconButton } from "@/shared/ui/IconButton"
import { GlassBackground } from "@/shared/ui/GlassBackground"
import { SessionHeader } from "./SessionHeader"
import { StatsGrid } from "./StatsGrid"
import { HeartRateChart } from "./HeartRateChart"
import { LocationMap } from "./LocationMap"
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

interface DeleteConfirmationSheetProps {
  visible: boolean
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function DeleteConfirmationSheet({
  visible,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmationSheetProps) {
  const { t } = useTranslation()
  const overlayColor =
    (useUnstableNativeVariable("--yb-result-delete-overlay") as unknown as string) ||
    "rgba(0,0,0,0.10)"
  const cardBackgroundColor =
    (useUnstableNativeVariable("--yb-result-delete-card-bg") as unknown as string) ||
    "#FFFFFF"
  const cardBorderColor =
    (useUnstableNativeVariable("--yb-result-delete-card-border") as unknown as string) ||
    "rgba(255,255,255,0.80)"
  const buttonBackgroundColor =
    (useUnstableNativeVariable("--yb-result-delete-button-bg") as unknown as string) ||
    "#F2EBDD"
  const buttonBorderColor =
    (useUnstableNativeVariable("--yb-result-delete-button-border") as unknown as string) ||
    "#DDD2BF"
  const buttonTextColor =
    (useUnstableNativeVariable("--yb-result-delete-button-fg") as unknown as string) ||
    "#BD413F"

  if (!visible) {
    return null
  }

  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: overlayColor, elevation: 20, zIndex: 20 }}
    >
      <Pressable className="absolute inset-0" onPress={onCancel} />
      <View
        className="w-[84%] max-w-[390px] overflow-hidden rounded-yb-xl border px-yb-8 pb-yb-8 pt-yb-8"
        style={{
          backgroundColor: cardBackgroundColor,
          borderColor: cardBorderColor,
          elevation: 21,
          zIndex: 21,
        }}
      >
        <GlassBackground
          cornerRadius={16}
          fallbackClassName="bg-yb-result-delete-card-bg"
        />
        <Text className="mb-yb-2 text-yb-heading-sm font-semibold text-yb-fg">
          {t("workout.result.deleteTitle")}
        </Text>
        <Text className="mb-yb-8 text-yb-body-sm leading-yb-5 text-yb-fg-secondary">
          {t("workout.result.deleteMessage")}
        </Text>
        <Pressable
          disabled={isDeleting}
          className="h-yb-btn-md w-full items-center justify-center overflow-hidden rounded-full border px-yb-6 shadow-sm active:opacity-80"
          onPress={onConfirm}
          style={{
            backgroundColor: buttonBackgroundColor,
            borderColor: buttonBorderColor,
          }}
        >
          <GlassBackground
            cornerRadius={999}
            fallbackClassName="bg-yb-result-delete-button-bg"
          />
          <Text
            className="text-yb-body-lg font-bold"
            style={{ color: buttonTextColor }}
          >
            {t("workout.result.deleteConfirmYes")}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

export function ResultScreen({ sessionId, fromWorkout = false }: ResultScreenProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const fgColor = (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"
  const deleteCtaBackgroundColor =
    (useUnstableNativeVariable("--yb-result-delete-cta-bg") as unknown as string) ||
    "rgba(237,228,214,0.95)"
  const deleteCtaBorderColor =
    (useUnstableNativeVariable("--yb-result-delete-cta-border") as unknown as string) ||
    "rgba(255,255,255,0.70)"
  const deleteCtaTextColor =
    (useUnstableNativeVariable("--yb-result-delete-cta-fg") as unknown as string) ||
    "#BD413F"
  const { data, isLoading } = useSessionDetail(sessionId)
  const stored = data?.stored
  const hk = data?.hk
  const [memo, setMemo] = useState(stored?.memo ?? "")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteSheetVisible, setIsDeleteSheetVisible] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setMemo(stored?.memo ?? "")
  }, [sessionId, stored?.memo])

  useEffect(() => {
    const initialMemo = stored?.memo ?? ""
    if (!sessionId || memo === initialMemo) {
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      void updateStoredWorkoutMemo(sessionId, memo)
    }, 300)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [memo, sessionId, stored?.memo])

  const dateLabel = stored?.startedAt
    ? formatDateWithDay(new Date(stored.startedAt))
    : t("workout.result.noData")
  const bodyPartTitle =
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
  const locationLabel = stored?.location ? t("workout.result.location") : null
  const totalSets =
    stored?.bodyParts.reduce((sum, item) => sum + item.setCount, 0) ?? 0
  const avgHeartRate =
    hk?.heartRateSamples && hk.heartRateSamples.length > 0
      ? Math.round(
          hk.heartRateSamples.reduce((sum, item) => sum + item.bpm, 0) /
            hk.heartRateSamples.length,
        )
      : null
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

  const deleteSession = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }

    setIsDeleting(true)

    try {
      await deleteStoredWorkoutSession(sessionId)
      setIsDeleteSheetVisible(false)
      router.replace("/")
    } catch {
      Alert.alert(
        t("workout.result.deleteErrorTitle"),
        t("workout.result.deleteErrorMessage"),
      )
      setIsDeleting(false)
    }
  }

  const handleDeletePress = () => {
    if (!stored || isDeleting) {
      return
    }

    setIsDeleteSheetVisible(true)
  }

  return (
    <Main>
      {/* 네비게이션 */}
      <View className="flex-row items-center px-yb-5 pt-yb-2 pb-yb-4 gap-yb-3">
        <IconButton
          variant="back-square"
          onPress={() =>
            fromWorkout ? router.replace("/") : router.back()
          }
        >
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text className="text-yb-fg text-yb-title flex-1">{dateLabel}</Text>
        <View className="w-yb-icon-btn" />
      </View>

      {isLoading ? (
        <View className="grow items-center justify-center px-yb-5">
          <ActivityIndicator color={fgColor} />
        </View>
      ) : !stored ? (
        <View className="grow items-center justify-center px-yb-5">
          <Text className="text-yb-fg text-yb-heading-sm">
            {t("workout.result.noData")}
          </Text>
        </View>
      ) : (
        <ScrollView
          className="grow"
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 18) + 32 }}
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
          />

          {/* 메모 */}
          <View className="mt-yb-6">
            <GlassTextarea
              key={sessionId}
              placeholder={t("workout.result.memoPlaceholder")}
              value={memo}
              onChangeText={setMemo}
            />
          </View>

          {/* 운동세부사항 */}
          <Text className="text-yb-fg text-yb-heading-sm mt-yb-8 mb-yb-3">
            {t("workout.result.statsTitle")}
          </Text>
          <StatsGrid
            duration={hk?.duration != null ? formatDuration(hk.duration) : null}
            calories={hk?.activeKcal ?? null}
            totalSets={totalSets}
            avgHeartRate={avgHeartRate}
          />

          {/* 심박수 */}
          {chartData.length > 0 && (
            <>
              <Text className="text-yb-fg text-yb-heading-sm mt-yb-8 mb-yb-3">
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
              <Text className="text-yb-fg text-yb-heading-sm mt-yb-8 mb-yb-3">
                {t("workout.result.mapTitle")}
              </Text>
              <LocationMap
                latitude={stored.location.lat}
                longitude={stored.location.lng}
                locationName={t("workout.result.unspecified")}
              />
            </>
          )}

          <View className="items-center">
            <Pressable
              disabled={isDeleting}
              className="min-h-yb-btn-md w-[72%] max-w-[340px] items-center justify-center overflow-hidden rounded-full border px-yb-7 py-yb-4 shadow-lg active:opacity-80"
              onPress={handleDeletePress}
              style={{
                backgroundColor: deleteCtaBackgroundColor,
                borderColor: deleteCtaBorderColor,
              }}
            >
              <GlassBackground
                cornerRadius={999}
                fallbackClassName="bg-yb-result-delete-cta-bg"
              />
              <Text
                className="text-yb-body-lg font-semibold"
                style={{ color: deleteCtaTextColor }}
              >
                {t("workout.result.deleteConfirm")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      <DeleteConfirmationSheet
        visible={isDeleteSheetVisible}
        isDeleting={isDeleting}
        onCancel={() => setIsDeleteSheetVisible(false)}
        onConfirm={() => void deleteSession()}
      />
    </Main>
  )
}
