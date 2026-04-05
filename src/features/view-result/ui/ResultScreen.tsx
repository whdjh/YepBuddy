import { ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Main } from "@/shared/ui/Main"
import { IconButton } from "@/shared/ui/IconButton"
import { SessionHeader } from "./SessionHeader"
import { GlassTextarea } from "@/shared/ui/Input"
import { StatsGrid } from "./StatsGrid"
import { HeartRateChart } from "./HeartRateChart"
import { LocationMap } from "./LocationMap"
import { formatDuration, formatTime } from "@/shared/lib/format"

// TODO: HealthKit + AsyncStorage 연동
const MOCK = {
  date: "3월 15일",
  bodyPartLabel: "가슴",
  startTime: "오후 7:11",
  endTime: "오후 7:52",
  location: "용인시",
  memo: "벤치 80(8) 100(3) 90(6)",
  duration: 2493,
  calories: 273,
  totalSets: 18,
  heartRateData: Array.from({ length: 40 }, (_, i) => ({
    startDate: new Date(2026, 2, 15, 19, 11 + i).toISOString(),
    bpm: 100 + Math.round(Math.sin(i * 0.3) * 20 + ((i * 7 + 3) % 15)),
  })),
  coords: { lat: 37.2411, lng: 127.1776 },
}

interface ResultScreenProps {
  sessionId: string
}

export function ResultScreen({ sessionId }: ResultScreenProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const fgColor = (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"

  const data = MOCK
  const avgHeartRate =
    data.heartRateData.length > 0
      ? Math.round(data.heartRateData.reduce((s, d) => s + d.bpm, 0) / data.heartRateData.length)
      : null

  const chartData = data.heartRateData.map((d, i) => ({ time: i, bpm: d.bpm }))
  const startTimeLabel = data.heartRateData.length > 0 ? formatTime(data.heartRateData[0].startDate) : ""
  const endTimeLabel = data.heartRateData.length > 0 ? formatTime(data.heartRateData[data.heartRateData.length - 1].startDate) : ""

  return (
    <Main>
      {/* 네비게이션 */}
      <View className="flex-row items-center px-yb-5 pt-yb-2 pb-yb-4 gap-yb-3">
        <IconButton variant="back-square" onPress={() => router.back()}>
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text className="text-yb-fg text-yb-title">{data.date}</Text>
      </View>

      <ScrollView
        className="grow"
        contentContainerClassName="px-yb-5 pb-yb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* 세션 헤더 */}
        <SessionHeader
          bodyPartLabel={data.bodyPartLabel}
          startTime={data.startTime}
          endTime={data.endTime}
          location={data.location}
        />

        {/* 메모 */}
        <View className="mt-yb-6">
          <GlassTextarea
            placeholder={t("workout.result.memoPlaceholder")}
            defaultValue={data.memo}
          />
        </View>

        {/* 운동세부사항 */}
        <Text className="text-yb-fg text-yb-heading-sm mt-yb-8 mb-yb-3">
          {t("workout.result.statsTitle")}
        </Text>
        <StatsGrid
          duration={formatDuration(data.duration)}
          calories={data.calories}
          totalSets={data.totalSets}
          avgHeartRate={avgHeartRate}
        />

        {/* 심박수 */}
        <Text className="text-yb-fg text-yb-heading-sm mt-yb-8 mb-yb-3">
          {t("workout.result.heartRateChart")}
        </Text>
        <HeartRateChart
          data={chartData}
          avgBpm={avgHeartRate}
          startTimeLabel={startTimeLabel}
          endTimeLabel={endTimeLabel}
        />

        {/* Map */}
        {data.coords && (
          <>
            <Text className="text-yb-fg text-yb-heading-sm mt-yb-8 mb-yb-3">
              {t("workout.result.mapTitle")}
            </Text>
            <LocationMap
              latitude={data.coords.lat}
              longitude={data.coords.lng}
              locationName={data.location ?? ""}
            />
          </>
        )}
      </ScrollView>
    </Main>
  )
}
