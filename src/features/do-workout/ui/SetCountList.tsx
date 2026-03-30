import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { Stepper } from "@/shared/ui/Stepper"

interface SetCountListProps {
  selectedParts: Record<string, number>
  onUpdate: (key: string, value: number) => void
}

export function SetCountList({ selectedParts, onUpdate }: SetCountListProps) {
  const { t } = useTranslation()

  return (
    <>
      {Object.keys(selectedParts).map((key) => (
        <View key={key} className="px-yb-5 mt-yb-5">
          <Text className="text-yb-fg font-bold text-yb-body-md mb-yb-2">
            {t(`workout.bodyParts.${key}`)}
          </Text>
          <Stepper
            variant="glass"
            label={t("workout.active.setsUnit")}
            value={selectedParts[key]}
            unit={t("workout.active.setsUnit")}
            min={1}
            onDecrement={() => onUpdate(key, selectedParts[key] - 1)}
            onIncrement={() => onUpdate(key, selectedParts[key] + 1)}
          />
        </View>
      ))}
    </>
  )
}
