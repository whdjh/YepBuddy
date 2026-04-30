import { useEffect, useRef, useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import {
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
  expandedPart?: BodyPart | null
}

export function BodyPartSelector({ selectedParts, onToggle, onToggleDetail, expandedPart }: BodyPartSelectorProps) {
  const { t } = useTranslation()
  const [detailPart, setDetailPart] = useState<BodyPart | null>(null)
  const suppressNextPressRef = useRef<BodyPart | null>(null)

  useEffect(() => {
    if (expandedPart !== undefined) {
      setDetailPart(expandedPart ?? null)
    }
  }, [expandedPart])

  const handleLongPress = (key: BodyPart) => {
    suppressNextPressRef.current = key
    setDetailPart((current) => (current === key ? null : key))
  }

  const selectedDetailPartDetails = detailPart
    ? getWorkoutBodyPartDetails(selectedParts, detailPart)
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
            <Pressable
              key={key}
              onPress={() => {
                if (suppressNextPressRef.current === key) {
                  suppressNextPressRef.current = null
                  return
                }

                setDetailPart(null)
                onToggle(key)
              }}
              onLongPress={hasDetailOptions ? () => handleLongPress(key) : undefined}
              delayLongPress={400}
              className={`h-yb-chip rounded-yb-chip border px-[18px] items-center justify-center ${
                active ? "bg-yb-accent border-yb-accent" : "bg-yb-fill-pale border-yb-border"
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

      {detailPart && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row gap-2 pt-yb-3 pl-1"
        >
          {BODY_PART_DETAILS[detailPart].map((detail) => {
            const active = selectedDetailPartDetails.includes(detail)
            return (
              <Pressable
                key={detail}
                onPress={() => onToggleDetail?.(detailPart, detail)}
                className={`px-3 py-1.5 rounded-full border ${
                  active ? "bg-yb-accent border-yb-accent" : "bg-yb-surface border-yb-border"
                }`}
              >
                <Text
                  className={`text-yb-body-sm ${
                    active ? "text-yb-on-accent font-medium" : "text-yb-fg-secondary"
                  }`}
                >
                  {bodyPartDetailLabel(detail)}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}
