import { Pressable, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Card } from "@/shared/ui/Card"

interface WorkoutLinkCardProps {
  disabled?: boolean
}

export function WorkoutLinkCard({ disabled = false }: WorkoutLinkCardProps) {
  const router = useRouter()

  const { t } = useTranslation()

  const accentColor = (useUnstableNativeVariable("--yb-accent") as unknown as string) || "#9B7E56"

  return (
    <Pressable
      onPress={() => !disabled && router.push("/workout/countdown")}
      disabled={disabled}
      className={disabled ? "opacity-40" : ""}
    >
      <Card variant="glass">
        <View className="flex-row items-center justify-between mb-yb-3.5">                                                                                                     
          <Text className="text-yb-fg-secondary text-yb-label">{t("summary.workout")}</Text>                                                                     
        </View>  
        <View className="w-yb-icon-xl h-yb-icon-xl rounded-yb-xl bg-yb-fill-pale items-center justify-center self-center mb-yb-2.5">
          <SymbolView name="play.fill" size={28} tintColor={accentColor} />
        </View>
        <Text className="text-yb-fg text-yb-body-md font-bold text-center">{t("summary.strengthTraining")}</Text>
        <View className="flex-row items-center justify-center gap-yb-1 mt-yb-2.5">
          <View className="w-yb-2 h-yb-2 rounded-full bg-yb-accent" />
          <Text className="text-yb-accent text-yb-body-md font-semibold">{t("summary.startWorkout")}</Text>
        </View>
      </Card>
    </Pressable>
  )
}
