import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Card } from "@/shared/ui/Card"
import { formatDateWithDay, bodyPartLabel } from "@/shared/lib/format"

interface SessionCardProps {
  bodyParts: string[]
  kcal: number
  date: Date
  onPress: () => void
}

export function SessionCard({ bodyParts, kcal, date, onPress }: SessionCardProps) {
  const { t } = useTranslation()
  const accentColor = (useUnstableNativeVariable("--yb-accent") as unknown as string) || "#9B7E56"

  return (
    <Pressable className="mb-yb-3" onPress={onPress}>
      <Card variant="default">
        <View className="flex-row items-center gap-yb-4">
          <View className="w-[56px] h-[56px] rounded-yb-md bg-yb-fill-pale items-center justify-center">
            <SymbolView name="dumbbell.fill" size={22} tintColor={accentColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-yb-fg text-yb-body-md font-bold">
              {bodyParts.map(bodyPartLabel).join(" + ")}
            </Text>
            <Text className="text-yb-accent text-yb-heading-sm font-bold">
              {kcal}
              <Text className="text-yb-fg-secondary text-yb-caption font-medium">
                {` ${t("summary.kcalUnit")}`}
              </Text>
            </Text>
          </View>
          <Text className="text-yb-fg-secondary text-yb-caption self-end">
            {formatDateWithDay(date)}
          </Text>
        </View>
      </Card>
    </Pressable>
  )
}
