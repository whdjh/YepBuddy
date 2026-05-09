import { memo, useCallback } from "react"
import { Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "@/shared/ui/Card"
import { BodyPartIconHost } from "@/shared/ui/BodyPartIcon"
import { formatDateWithDay, bodyPartLabel } from "@/shared/lib/format"
import type { BodyPart } from "@/entities/workout-session"

interface SessionCardProps {
  sessionId: string
  bodyParts: BodyPart[]
  kcal: number | null
  date: Date
  onPress: (sessionId: string) => void
}

function SessionCardComponent({ sessionId, bodyParts, kcal, date, onPress }: SessionCardProps) {
  const { t } = useTranslation()
  const bodyPartLabelText =
    bodyParts.length > 0
      ? bodyParts.map(bodyPartLabel).join(" + ")
      : t("workout.result.unspecified")
  const representativeBodyPart = bodyParts[0] ?? null

  const handlePress = useCallback(() => onPress(sessionId), [onPress, sessionId])

  return (
    <Pressable
      className="mb-yb-3"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${formatDateWithDay(date)} ${bodyPartLabelText}`}
    >
      <Card variant="glass">
        <Card.Row spacing={14} alignment="center">
          <BodyPartIconHost bodyPart={representativeBodyPart} size="md" />
          <Card.Column alignment="leading" spacing={6}>
            <Card.Title>{bodyPartLabelText}</Card.Title>
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

export const SessionCard = memo(SessionCardComponent)
