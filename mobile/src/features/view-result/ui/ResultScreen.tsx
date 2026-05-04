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
  getStoredWorkoutSessionDurationSeconds,
  getWorkoutBodyPartSetLabel,
  updateStoredWorkoutMemo,
} from "@/entities/workout-session"
import { Main } from "@/shared/ui/Main"
import { GlassTextarea } from "@/shared/ui/Input"
import { IconButton } from "@/shared/ui/IconButton"
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

export function ResultScreen({ sessionId, fromWorkout = false }: ResultScreenProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const fgColor = (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"
  const { data, isLoading } = useSessionDetail(sessionId)
  const stored = data?.stored
  const hk = data?.hk
  const [memo, setMemo] = useState(stored?.memo ?? "")
  const [isDeleting, setIsDeleting] = useState(false)
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
      <View className="flex-row items-center px-yb-5 pt-yb-2 pb-yb-4 gap-yb-3">
        <IconButton
          variant="back-square"
          onPress={() =>
            fromWorkout ? router.replace("/") : router.back()
          }
        >
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text className="min-w-0 grow shrink text-yb-title text-yb-fg" numberOfLines={1}>
          {dateLabel}
        </Text>
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
            duration={
              hk?.duration != null
                ? formatDuration(hk.duration)
                : stored
                  ? formatDuration(getStoredWorkoutSessionDurationSeconds(stored))
                  : null
            }
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

          <View className="mt-yb-8 items-center">
            <Pressable
              disabled={isDeleting}
              className="min-h-yb-btn-md w-[72%] max-w-[340px] items-center justify-center rounded-full bg-yb-status-error px-yb-7 py-yb-4 shadow-lg active:opacity-80"
              onPress={handleDeletePress}
            >
              <Text className="text-yb-body-lg font-semibold text-white">
                {t("workout.result.deleteConfirm")}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </Main>
  )
}
