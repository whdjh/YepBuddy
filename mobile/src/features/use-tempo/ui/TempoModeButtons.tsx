import { View } from "react-native"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/ui/Button"

interface TempoModeButtonsProps {
  modeIndex: number
  onChangeMode: (index: number) => void
}

export function TempoModeButtons({
  modeIndex,
  onChangeMode,
}: TempoModeButtonsProps) {
  const { t } = useTranslation()

  return (
    <View className="flex-row gap-yb-3 mb-yb-4">
      <View className="grow">
        <Button
          variant={modeIndex === 0 ? "accent" : "glass"}
          label={t("tempo.contractionFirst")}
          onPress={() => onChangeMode(0)}
        />
      </View>
      <View className="grow">
        <Button
          variant={modeIndex === 1 ? "accent" : "glass"}
          label={t("tempo.relaxationFirst")}
          onPress={() => onChangeMode(1)}
        />
      </View>
    </View>
  )
}
