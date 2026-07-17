import { useRef } from "react"
import { ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import {
  BodyPartDetailSelectionChip,
  BodyPartSelectionChip,
  getWorkoutBodyPartDetails,
  BODY_PART_DETAILS,
  type BodyPart,
  type BodyPartDetail,
  type WorkoutBodyPartSet,
} from "@/entities/workout-session"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"

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
  onToggleDetail?: (part: BodyPart, detail: BodyPartDetail) => void
  expandedPart: BodyPart | null
  onExpandedPartChange: (part: BodyPart | null) => void
}

export function BodyPartSelector({
  selectedParts,
  onToggle,
  onToggleDetail,
  expandedPart,
  onExpandedPartChange,
}: BodyPartSelectorProps) {
  const { t } = useTranslation()
  const suppressNextPressRef = useRef<BodyPart | null>(null)

  const handleLongPress = (key: BodyPart) => {
    suppressNextPressRef.current = key
    onExpandedPartChange(expandedPart === key ? null : key)
  }

  const selectedDetailPartDetails = expandedPart
    ? getWorkoutBodyPartDetails(selectedParts, expandedPart)
    : []

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
          const sel = selectedParts.find((bp) => bp.part === key)
          const active = !!sel
          const hasDetailOptions = BODY_PART_DETAILS[key].length > 0
          const label = bodyPartLabel(key)

          return (
            <BodyPartSelectionChip
              key={key}
              label={label}
              selected={active}
              accessibilityRole="button"
              onPress={() => {
                if (suppressNextPressRef.current === key) {
                  suppressNextPressRef.current = null
                  return
                }

                onToggle(key)
              }}
              onLongPress={
                active && hasDetailOptions
                  ? () => handleLongPress(key)
                  : undefined
              }
              delayLongPress={400}
            />
          )
        })}
      </ScrollView>

      {expandedPart && BODY_PART_DETAILS[expandedPart].length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-2 pt-yb-3 pl-1"
        >
          {BODY_PART_DETAILS[expandedPart].map((detail) => {
            const active = selectedDetailPartDetails.includes(detail)
            const label = bodyPartDetailLabel(detail)

            return (
              <BodyPartDetailSelectionChip
                key={detail}
                label={label}
                selected={active}
                accessibilityRole="button"
                onPress={() => onToggleDetail?.(expandedPart, detail)}
              />
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}
