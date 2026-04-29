import { Pressable, ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import type { BodyPart, WorkoutBodyPartSet } from "@/entities/workout-session/model/types"
import { BODY_PART_DETAILS } from "@/entities/workout-session/model/types"
import { bodyPartLabel } from "@/shared/lib/format"

const BODY_PART_KEYS: BodyPart[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
]

interface BodyPartSelectorProps {
  selectedParts: WorkoutBodyPartSet[]
  onToggle: (key: BodyPart) => void
  onLongPress?: (key: BodyPart) => void
}

export function BodyPartSelector({ selectedParts, onToggle, onLongPress }: BodyPartSelectorProps) {
  const { t } = useTranslation()

  return (
    <View className="px-yb-6 mb-yb-5">
      <Text className="text-yb-fg font-bold text-yb-body-lg mb-yb-4">
        {t("workout.active.bodyPart")}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-[10px] pl-1"
      >
        {BODY_PART_KEYS.map((key) => {
          const selectedSet = selectedParts.find((bp) => bp.part === key)
          const active = !!selectedSet
          const hasDetails = (selectedSet?.details?.length ?? 0) > 0
          const hasDetailOptions = BODY_PART_DETAILS[key].length > 0
          const label = hasDetails ? `${bodyPartLabel(key)} ·` : bodyPartLabel(key)

          return (
            <Pressable
              key={key}
              onPress={() => onToggle(key)}
              onLongPress={hasDetailOptions ? () => onLongPress?.(key) : undefined}
              delayLongPress={400}
              className={`h-yb-chip rounded-yb-chip border px-[18px] items-center justify-center ${
                active
                  ? "bg-yb-accent border-yb-accent"
                  : "bg-yb-fill-pale border-yb-border"
              }`}
            >
              <Text
                className={`text-yb-body-sm font-medium ${
                  active ? "text-yb-on-accent" : "text-yb-fg"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
