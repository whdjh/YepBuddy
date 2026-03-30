import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { SymbolView } from "expo-symbols"

interface StatsSectionProps {
  heartRate: number
  activeKcal: number
  totalKcal: number
}

export function StatsSection({ heartRate, activeKcal, totalKcal }: StatsSectionProps) {
  const { t } = useTranslation()

  return (
    <>
      {/* 심박수 */}
      <View className="flex-row items-center gap-yb-2 mb-yb-8 px-yb-6">
        <Text className="text-yb-num-80 text-yb-fg">
          {heartRate}
        </Text>
        <View className="w-yb-icon-btn h-yb-icon-btn items-center justify-center mt-yb-3">
          <SymbolView
            name="heart.fill"
            size={24}
            tintColor="var(--yb-accent)"
          />
        </View>
      </View>

      {/* 칼로리 */}
      <View className="flex-row gap-yb-12 mb-yb-9 px-yb-6">
        <View>
          <Text className="text-yb-num-44 text-yb-fg">
            {activeKcal}
          </Text>
          <Text className="mt-yb-1.5 text-yb-label font-medium text-yb-fg-secondary">
            {t("workout.active.activeKcal")}
          </Text>
        </View>
        <View>
          <Text className="text-yb-num-44 text-yb-fg">
            {totalKcal}
          </Text>
          <Text className="mt-yb-1.5 text-yb-label font-medium text-yb-fg-secondary">
            {t("workout.active.totalKcal")}
          </Text>
        </View>
      </View>
    </>
  )
}
