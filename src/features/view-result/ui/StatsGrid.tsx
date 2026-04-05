import { View } from "react-native"
import { useTranslation } from "react-i18next"
import { StatCard } from "@/shared/ui/StatCard"

interface StatsGridProps {
  duration: string | null
  calories: number | null
  totalSets: number
  avgHeartRate: number | null
}

export function StatsGrid({
  duration,
  calories,
  totalSets,
  avgHeartRate,
}: StatsGridProps) {
  const { t } = useTranslation()

  return (
    <View className="gap-yb-3">
      <View className="flex-row gap-yb-3">
        <View className="basis-0 grow">
          <StatCard
            label={t("workout.result.duration")}
            value={duration ?? t("workout.result.noData")}
            unit=""
            minHeight={100}
            valueSize={28}
          />
        </View>
        <View className="basis-0 grow">
          <StatCard
            label={t("workout.result.calories")}
            value={calories != null ? String(calories) : t("workout.result.noData")}
            unit={calories != null ? t("workout.result.caloriesUnit") : ""}
            minHeight={100}
            valueSize={28}
          />
        </View>
      </View>
      <View className="flex-row gap-yb-3">
        <View className="basis-0 grow">
          <StatCard
            label={t("workout.result.totalSets")}
            value={String(totalSets)}
            unit={t("workout.result.setsUnit")}
            minHeight={100}
            valueSize={28}
          />
        </View>
        <View className="basis-0 grow">
          <StatCard
            label={t("workout.result.avgHeartRate")}
            value={avgHeartRate != null ? String(avgHeartRate) : t("workout.result.noData")}
            unit={avgHeartRate != null ? t("workout.result.heartRateUnit") : ""}
            minHeight={100}
            valueSize={28}
          />
        </View>
      </View>
    </View>
  )
}
