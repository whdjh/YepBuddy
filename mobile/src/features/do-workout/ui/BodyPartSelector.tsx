import { useRef, useState } from "react"
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native"
import type { View as RNView } from "react-native"
import { useTranslation } from "react-i18next"
import type { BodyPart, BodyPartDetail, WorkoutBodyPartSet } from "@/entities/workout-session/model/types"
import { BODY_PART_DETAILS } from "@/entities/workout-session/model/types"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"

const BODY_PART_KEYS: BodyPart[] = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
]

interface PopoverState {
  part: BodyPart
  pillX: number
  pillY: number
  pillWidth: number
}

interface BodyPartSelectorProps {
  selectedParts: WorkoutBodyPartSet[]
  onToggle: (key: BodyPart) => void
  onToggleDetail?: (part: BodyPart, detail: BodyPartDetail) => void
}

const POPOVER_HEIGHT = 52

export function BodyPartSelector({ selectedParts, onToggle, onToggleDetail }: BodyPartSelectorProps) {
  const { t } = useTranslation()
  const { width: screenWidth } = useWindowDimensions()
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const refs = useRef<Partial<Record<BodyPart, RNView | null>>>({})

  const handleLongPress = (key: BodyPart) => {
    const ref = refs.current[key]
    if (!ref) return
    ref.measure((_, __, width, _height, px, py) => {
      setPopover({ part: key, pillX: px, pillY: py, pillWidth: width })
    })
  }

  const popoverDetails = popover
    ? selectedParts.find((bp) => bp.part === popover.part)?.details ?? []
    : []

  const popoverLeft = popover ? Math.max(8, Math.min(popover.pillX, screenWidth - 200)) : 0
  const popoverTop = popover ? popover.pillY - POPOVER_HEIGHT - 8 : 0

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
          const hasDetails = (sel?.details?.length ?? 0) > 0
          const hasDetailOptions = BODY_PART_DETAILS[key].length > 0
          const label = hasDetails ? `${bodyPartLabel(key)} ·` : bodyPartLabel(key)

          return (
            <Pressable
              key={key}
              ref={(r) => { refs.current[key] = r }}
              onPress={() => {
                setPopover(null)
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

      {popover && (
        <Modal transparent animationType="none" onRequestClose={() => setPopover(null)}>
          <Pressable className="absolute inset-0" onPress={() => setPopover(null)}>
            <Pressable
              style={{ position: "absolute", top: popoverTop, left: popoverLeft }}
              className="flex-row gap-2"
              onPress={() => {}}
            >
              {BODY_PART_DETAILS[popover.part].map((detail) => {
                  const active = popoverDetails.includes(detail)
                  return (
                    <Pressable
                      key={detail}
                      onPress={() => onToggleDetail?.(popover.part, detail)}
                      className={`px-3 py-1.5 rounded-full border shadow-yb-sm ${
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
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  )
}
