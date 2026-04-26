import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "@/shared/ui/Card"
import { BodyPartIcon } from "@/shared/ui/BodyPartIcon"
import { formatDateWithDay, bodyPartLabel } from "@/shared/lib/format"
import type { BodyPart } from "@/entities/workout-session"

interface SessionCardProps {
  bodyParts: BodyPart[]
  kcal: number | null
  date: Date
  onPress: () => void
}

export function SessionCard({ bodyParts, kcal, date, onPress }: SessionCardProps) {
  const { t } = useTranslation()
  const bodyPartLabelText =
    bodyParts.length > 0
      ? bodyParts.map(bodyPartLabel).join(" + ")
      : t("workout.result.unspecified")
  const representativeBodyPart = bodyParts[0] ?? null

  return (
    <Pressable className="mb-yb-3" onPress={onPress}>
      <Card variant="default">
        <View className="flex-row items-center gap-yb-4">
          {representativeBodyPart ? (
            <BodyPartIcon bodyPart={representativeBodyPart} size="md" />
          ) : (
            <View className="w-[56px] h-[56px] rounded-yb-md bg-yb-fill-pale" />
          )}
          <View style={{ flex: 1 }}>
            <Text className="text-yb-fg text-yb-body-md font-bold">
              {bodyPartLabelText}
            </Text>
            <Text className="text-yb-accent text-yb-heading-sm font-bold">
              {kcal ?? "--"}
              <Text className="text-yb-fg-secondary text-yb-caption font-medium">
                {` ${t("summary.kcalUnit")}`}
              </Text>
            </Text>
          </View>
          <Text className="text-yb-fg-secondary text-yb-caption self-end">
            {formatDateWithDay(date)}
          </Text>
        </View>
      </Card>
    </Pressable>
  )
}
