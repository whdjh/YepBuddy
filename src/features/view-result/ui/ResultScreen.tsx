import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { updateStoredWorkoutMemo } from "@/entities/workout-session"
import { Main } from "@/shared/ui/Main"
import { GlassTextarea } from "@/shared/ui/Input"
import { IconButton } from "@/shared/ui/IconButton"
import { SessionHeader } from "./SessionHeader"
import { StatsGrid } from "./StatsGrid"
import { HeartRateChart } from "./HeartRateChart"
import { LocationMap } from "./LocationMap"
import {
  bodyPartLabel,
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
  const fgColor = (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"
  const { data, isLoading } = useSessionDetail(sessionId)
  const stored = data?.stored
  const hk = data?.hk
  const [memo, setMemo] = useState(stored?.memo ?? "")
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
      ? stored.bodyParts.map(({ part }) => bodyPartLabel(part)).join(", ")
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
        <Text className="text-yb-fg text-yb-title">{dateLabel}</Text>
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
          contentContainerClassName="px-yb-5 pb-yb-10"
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
        </ScrollView>
      )}
    </Main>
  )
}
