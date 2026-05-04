import { Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "@/shared/ui/Card"
import { BodyPartIconHost } from "@/shared/ui/BodyPartIcon"
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
      <Card variant="glass" cornerRadius={20} paddingSize={20}>
        <Card.Row spacing={14} alignment="center">
          <BodyPartIconHost bodyPart={representativeBodyPart} size="md" />
          <Card.Column alignment="leading" spacing={6}>
            <Card.Title size={15}>{bodyPartLabelText}</Card.Title>
            <Card.Metric
              value={kcal ?? "--"}
              unit={t("summary.kcalUnit")}
              valueSize={24}
              unitSize={12}
            />
          </Card.Column>
          <Card.Spacer />
          <Card.Caption size={12}>{formatDateWithDay(date)}</Card.Caption>
        </Card.Row>
      </Card>
    </Pressable>
  )
}
