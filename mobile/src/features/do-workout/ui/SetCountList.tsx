import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import {
  getWorkoutBodyPartSetKey,
  getWorkoutBodyPartSetLabel,
  type WorkoutBodyPartSet,
} from "@/entities/workout-session"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"
import { Stepper } from "@/shared/ui/Stepper"

interface SetCountListProps {
  selectedParts: WorkoutBodyPartSet[]
  onUpdate: (
    key: WorkoutBodyPartSet["part"],
    value: number,
    detail?: WorkoutBodyPartSet["detail"],
  ) => void
}

export function SetCountList({ selectedParts, onUpdate }: SetCountListProps) {
  const { t } = useTranslation()

  return (
    <>
      {selectedParts.map((selectedPart) => {
        const { part, setCount } = selectedPart
        const label = getWorkoutBodyPartSetLabel(selectedPart, {
          bodyPartLabel,
          bodyPartDetailLabel,
        })

        return (
          <View
            key={getWorkoutBodyPartSetKey(selectedPart)}
            className="px-yb-6 mt-yb-5"
          >
            <Text className="text-yb-fg font-bold text-yb-body-md mb-yb-4">
              {label}
            </Text>
            <Stepper
              variant="glass"
              label={t("workout.active.setsUnit")}
              value={setCount}
              unit={t("workout.active.setsUnit")}
              min={1}
              onDecrement={() =>
                onUpdate(part, setCount - 1, selectedPart.detail)
              }
              onIncrement={() =>
                onUpdate(part, setCount + 1, selectedPart.detail)
              }
            />
          </View>
        )
      })}
    </>
  )
}
