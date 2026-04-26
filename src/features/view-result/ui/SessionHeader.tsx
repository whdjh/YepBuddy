import { useTranslation } from "react-i18next"
import type { BodyPart } from "@/entities/workout-session"
import { BodyPartIconHost } from "@/shared/ui/BodyPartIcon"
import { Card } from "@/shared/ui/Card"

interface SessionHeaderProps {
  bodyPartLabel: string
  representativeBodyPart: BodyPart | null
  startTime: string
  endTime: string
  location: string | null
}

export function SessionHeader({
  bodyPartLabel,
  representativeBodyPart,
  startTime,
  endTime,
  location,
}: SessionHeaderProps) {
  const { t } = useTranslation()

  return (
    <Card variant="glass" paddingSize={16} cornerRadius={16}>
      <Card.Row spacing={12} alignment="center">
        {representativeBodyPart ? (
          <BodyPartIconHost bodyPart={representativeBodyPart} size="lg" />
        ) : (
          <Card.Icon name="dumbbell.fill" size={28} bgSize={64} cornerRadius={16} />
        )}
        <Card.Column alignment="leading" spacing={2}>
          <Card.Caption>{t("workout.result.strengthTraining")}</Card.Caption>
          <Card.Title size={20}>{bodyPartLabel}</Card.Title>
          <Card.Caption size={12}>{`${startTime} – ${endTime}${location ? ` · ${location}` : ""}`}</Card.Caption>
        </Card.Column>
        <Card.Spacer />
      </Card.Row>
    </Card>
  )
}
