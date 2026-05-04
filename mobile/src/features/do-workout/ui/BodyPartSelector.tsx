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
import { Chip } from "@/shared/ui/Chip"
import { GlassSurface } from "@/shared/ui/GlassSurface"

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
            <Chip
              key={key}
              variant={active ? "active" : "glass"}
              label={label}
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
            />
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

            if (active) {
              return (
                <Pressable
                  key={detail}
                  onPress={() => onToggleDetail?.(detailPart, detail)}
                  className="rounded-full border border-yb-accent bg-yb-accent px-3 py-1.5"
                >
                  <Text className="text-yb-body-sm font-medium text-yb-on-accent">
                    {bodyPartDetailLabel(detail)}
                  </Text>
                </Pressable>
              )
            }

            return (
              <GlassSurface
                key={detail}
                cornerRadius={999}
                fallbackClassName="bg-yb-surface/70"
              >
                <Pressable
                  onPress={() => onToggleDetail?.(detailPart, detail)}
                  className="rounded-full px-3 py-1.5 active:opacity-80"
                >
                  <Text className="text-yb-body-sm text-yb-fg-secondary">
                    {bodyPartDetailLabel(detail)}
                  </Text>
                </Pressable>
              </GlassSurface>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}
