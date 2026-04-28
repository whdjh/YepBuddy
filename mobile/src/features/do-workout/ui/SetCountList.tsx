import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import type { WorkoutBodyPartSet } from "@/entities/workout-session/model/types"
import { bodyPartLabel } from "@/shared/lib/format"
import { Stepper } from "@/shared/ui/Stepper"

interface SetCountListProps {
  selectedParts: WorkoutBodyPartSet[]
  onUpdate: (key: WorkoutBodyPartSet["part"], value: number) => void
}

export function SetCountList({ selectedParts, onUpdate }: SetCountListProps) {
  const { t } = useTranslation()

  return (
    <>
      {selectedParts.map(({ part, setCount }) => (
        <View key={part} className="px-yb-6 mt-yb-5">
          <Text className="text-yb-fg font-bold text-yb-body-md mb-yb-4">
            {bodyPartLabel(part)}
          </Text>
          <Stepper
            variant="glass"
            label={t("workout.active.setsUnit")}
            value={setCount}
            unit={t("workout.active.setsUnit")}
            min={1}
            onDecrement={() => onUpdate(part, setCount - 1)}
            onIncrement={() => onUpdate(part, setCount + 1)}
          />
        </View>
      ))}
    </>
  )
}
