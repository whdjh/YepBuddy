import { Text, View, useColorScheme } from "react-native"
import { useTranslation } from "react-i18next"
import { SymbolView } from "expo-symbols"

interface StatsSectionProps {
  heartRate: number
  activeKcal: number
  totalKcal: number
}

export function StatsSection({ heartRate, activeKcal, totalKcal }: StatsSectionProps) {
  const { t } = useTranslation()
  const isDark = useColorScheme() === "dark"

  return (
    <>
      {/* 심박수 */}
      <View className="flex-row items-center gap-yb-2 mb-yb-8 px-yb-5">
        <Text
          className="text-yb-fg font-bold"
          style={{ fontSize: 80, lineHeight: 80 }}
        >
          {heartRate}
        </Text>
        <SymbolView
          name="heart.fill"
          size={24}
          tintColor={isDark ? "#C8AD7E" : "#9B7E56"}
          style={{ width: 24, height: 24, marginTop: 12 }}
        />
      </View>

      {/* 칼로리 */}
      <View className="flex-row gap-yb-12 mb-yb-9 px-yb-5">
        <View>
          <Text
            className="text-yb-fg font-bold"
            style={{ fontSize: 44, lineHeight: 44 }}
          >
            {activeKcal}
          </Text>
          <Text
            className="mt-yb-1.5"
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: isDark ? "rgba(255,255,255,0.45)" : "#876B45",
            }}
          >
            {t("workout.active.activeKcal")}
          </Text>
        </View>
        <View>
          <Text
            className="text-yb-fg font-bold"
            style={{ fontSize: 44, lineHeight: 44 }}
          >
            {totalKcal}
          </Text>
          <Text
            className="mt-yb-1.5"
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: isDark ? "rgba(255,255,255,0.45)" : "#876B45",
            }}
          >
            {t("workout.active.totalKcal")}
          </Text>
        </View>
      </View>
    </>
  )
}
