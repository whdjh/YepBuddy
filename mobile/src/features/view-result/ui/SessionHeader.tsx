import { useTranslation } from "react-i18next"
import type { BodyPart } from "@/entities/workout-session"
import { BodyPartIconHost } from "@/entities/workout-session"
import { Card } from "@/shared/ui/Card"

interface SessionHeaderProps {
  bodyPartLabel: string
  representativeBodyPart: BodyPart | null
  startTime: string
  endTime: string
  location: string | null
  isDeload?: boolean
}

export function SessionHeader({
  bodyPartLabel,
  representativeBodyPart,
  startTime,
  endTime,
  location,
  isDeload = false,
}: SessionHeaderProps) {
  const { t } = useTranslation()

  return (
    <Card variant="glass" paddingSize={16} cornerRadius={16}>
      <Card.Row spacing={12} alignment="center">
        {representativeBodyPart ? (
          <BodyPartIconHost bodyPart={representativeBodyPart} size="lg" />
        ) : (
          <Card.Icon name="dumbbell.fill" variant="xl" />
        )}
        <Card.Column alignment="leading" spacing={2}>
          <Card.Header
            label={t("workout.result.strengthTraining")}
            badge={
              isDeload ? t("workout.routineCycle.status.deload") : undefined
            }
          />
          <Card.Title size={20}>{bodyPartLabel}</Card.Title>
          <Card.Caption size={12}>{`${startTime} – ${endTime}${location ? ` · ${location}` : ""}`}</Card.Caption>
        </Card.Column>
        <Card.Spacer />
      </Card.Row>
    </Card>
  )
}
