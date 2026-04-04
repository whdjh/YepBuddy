import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Card } from "@/shared/ui/Card"

interface SessionLinkCardProps {
  bodyPart: string
  kcal: number
  day: string
}

export function SessionLinkCard({ bodyPart, kcal, day }: SessionLinkCardProps) {
  const { t } = useTranslation()
  
  const accentColor = (useUnstableNativeVariable("--yb-accent") as unknown as string) || "#9B7E56"
  const fgSecondary = (useUnstableNativeVariable("--yb-fg-secondary") as unknown as string) || "#876B45"

  return (
    <Pressable onPress={() => {}}>
      <Card variant="glass">
        <View className="flex-row items-center justify-between mb-yb-3.5">
          <Text className="text-yb-fg-secondary text-yb-label">{t("summary.session")}</Text>
          <SymbolView name="chevron.right" size={14} tintColor={fgSecondary} />
        </View>
        <View className="w-yb-icon-sm h-yb-touch rounded-yb-icon bg-yb-fill-pale items-center justify-center mb-yb-2.5">
          <SymbolView name="dumbbell.fill" size={22} tintColor={accentColor} />
        </View>
        <Text className="text-yb-fg text-yb-body-md font-bold">{bodyPart}</Text>
        <Text className="text-yb-accent text-yb-heading-md font-bold mt-yb-0.5">
          {kcal}{t("summary.kcalUnit")}
        </Text>
        <Text className="text-yb-fg-secondary text-yb-label mt-yb-2">{day}</Text>
      </Card>
    </Pressable>
  )
}
