import { Pressable, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Card } from "@/shared/ui/Card"
import { RingProgress } from "@/shared/ui/RingProgress"

interface TodayWorkoutCardProps {
  bodyParts: string
  totalSets: number
  targetSets: number
}

export function TodayWorkoutCard({ bodyParts, totalSets, targetSets }: TodayWorkoutCardProps) {
  const router = useRouter()

  const { t } = useTranslation()

  const ringTrack = (useUnstableNativeVariable("--yb-ring-track") as unknown as string) || "#EDE4D6"
  const ringFill = (useUnstableNativeVariable("--yb-ring-fill") as unknown as string) || "#9B7E56"
  const fgSecondary = (useUnstableNativeVariable("--yb-fg-secondary") as unknown as string) || "#876B45"

  return (
    <Pressable onPress={() => router.push("/calendar")}>
      <Card variant="glass">
        <View className="flex-row items-center justify-between">
          <RingProgress
            size={90}
            strokeWidth={10}
            progress={targetSets > 0 ? totalSets / targetSets : 0}
            trackColor={ringTrack}
            fillColor={ringFill}
          >
            <Text className="text-yb-fg text-yb-num-sm">{totalSets}</Text>
          </RingProgress>
          <View className="gap-yb-1">
            <Text className="text-yb-fg-secondary text-yb-label">{t("summary.todayWorkout")}</Text>
            <Text className="text-yb-fg text-yb-heading-lg">{bodyParts}</Text>
            <Text className="text-yb-accent text-yb-heading-lg">
              {totalSets}{t("summary.setsUnit")}
            </Text>
          </View>
          <SymbolView name="chevron.right" size={18} tintColor={fgSecondary} />
        </View>
      </Card>
    </Pressable>
  )
}
