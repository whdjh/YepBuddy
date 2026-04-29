import { Modal, Pressable, ScrollView, Text, View } from "react-native"
import type { BodyPart, BodyPartDetail } from "@/entities/workout-session/model/types"
import { BODY_PART_DETAILS } from "@/entities/workout-session/model/types"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"

interface BodyPartDetailSheetProps {
  visible: boolean
  bodyPart: BodyPart | null
  selectedDetails: BodyPartDetail[]
  onToggleDetail: (detail: BodyPartDetail) => void
  onClose: () => void
}

export function BodyPartDetailSheet({
  visible,
  bodyPart,
  selectedDetails,
  onToggleDetail,
  onClose,
}: BodyPartDetailSheetProps) {
  if (!bodyPart) {
    return null
  }
  
  if (BODY_PART_DETAILS[bodyPart].length === 0) {
    return null
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="grow justify-end" onPress={onClose}>
        <Pressable
          className="bg-yb-surface-subtle rounded-t-2xl px-6 pt-4 pb-8"
          onPress={() => {}}
        >
          <View className="w-10 h-1 rounded-full bg-yb-border self-center mb-4" />
          <Text className="text-yb-fg text-lg font-semibold mb-4">
            {bodyPartLabel(bodyPart)}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-2"
          >
            {BODY_PART_DETAILS[bodyPart].map((detail) => {
              const active = selectedDetails.includes(detail)
              return (
                <Pressable
                  key={detail}
                  onPress={() => onToggleDetail(detail)}
                  className={`px-4 py-2 rounded-full border ${
                    active
                      ? "bg-yb-accent border-yb-accent"
                      : "bg-transparent border-yb-border"
                  }`}
                >
                  <Text
                    className={`text-sm ${
                      active ? "text-yb-on-accent font-medium" : "text-yb-fg-secondary"
                    }`}
                  >
                    {bodyPartDetailLabel(detail)}
                  </Text>
                </Pressable>
              )
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}
