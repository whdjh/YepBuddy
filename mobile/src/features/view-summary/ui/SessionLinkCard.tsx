import { Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import {
  BodyPartIconHost,
  type BodyPart,
} from "@/entities/workout-session"
import { Card } from "@/shared/ui/Card"

interface SessionLinkCardProps {
  bodyPart: string
  representativeBodyPart: BodyPart | null
  kcal: number | string
  day: string
  onPress?: () => void
  onLongPress?: () => void
}

export function SessionLinkCard({
  bodyPart,
  representativeBodyPart,
  kcal,
  day,
  onPress,
  onLongPress,
}: SessionLinkCardProps) {
  const { t } = useTranslation()

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      disabled={!onPress && !onLongPress}
    >
      <Card variant="glass" minHeight={200}>
        <Card.Column alignment="leading" spacing={0}>
          <Card.Header label={t("summary.session")} chevron />
          <Card.Spacer size={12} />
          {representativeBodyPart ? (
            <BodyPartIconHost bodyPart={representativeBodyPart} size="md" />
          ) : (
            <Card.Icon name="dumbbell.fill" />
          )}
          <Card.Spacer size={10} />
          <Card.Title>{bodyPart}</Card.Title>
          <Card.Spacer size={8} />
          <Card.Row spacing={6} alignment="center">
            <Card.Caption>{`${kcal}${t("summary.kcalUnit")}`}</Card.Caption>
            <Card.Dot />
            <Card.Caption>{day}</Card.Caption>
          </Card.Row>
        </Card.Column>
      </Card>
    </Pressable>
  )
}
