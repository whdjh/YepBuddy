import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { Host, ScrollView as SwiftScrollView, HStack } from "@expo/ui/swift-ui"
import { padding } from "@expo/ui/swift-ui/modifiers"
import { BodyPartPill } from "@/shared/ui/Chip"

const BODY_PART_KEYS = ["chest", "back", "legs", "shoulders", "arms", "core"] as const

interface BodyPartSelectorProps {
  selectedParts: Record<string, number>
  onToggle: (key: string) => void
}

export function BodyPartSelector({ selectedParts, onToggle }: BodyPartSelectorProps) {
  const { t } = useTranslation()

  return (
    <View className="px-yb-5 mb-yb-5">
      <Text className="text-yb-fg font-bold text-yb-body-lg mb-yb-3">
        {t("workout.active.bodyPart")}
      </Text>
      <Host style={{ height: 44 }}>
        <SwiftScrollView axes="horizontal" showsIndicators={false}>
          <HStack spacing={10} modifiers={[padding({ leading: 4 })]}>
            {BODY_PART_KEYS.map((key) => (
              <BodyPartPill
                key={key}
                variant={key in selectedParts ? "active" : "default"}
                label={t(`workout.bodyParts.${key}`)}
                onPress={() => onToggle(key)}
              />
            ))}
          </HStack>
        </SwiftScrollView>
      </Host>
    </View>
  )
}
