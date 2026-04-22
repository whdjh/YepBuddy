import { Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "@/shared/ui/Card"

interface SessionLinkCardProps {
  bodyPart: string
  kcal: number | string
  day: string
  onPress?: () => void
}

export function SessionLinkCard({
  bodyPart,
  kcal,
  day,
  onPress,
}: SessionLinkCardProps) {
  const { t } = useTranslation()

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card variant="glass" minHeight={200}>
        <Card.Column alignment="leading" spacing={0}>
          <Card.Header label={t("summary.session")} chevron />
          <Card.Spacer size={12} />
          <Card.Icon name="dumbbell.fill" />
          <Card.Spacer size={10} />
          <Card.Title>{bodyPart}</Card.Title>
          <Card.Accent>{`${kcal}${t("summary.kcalUnit")}`}</Card.Accent>
          <Card.Spacer size={8} />
          <Card.Caption>{day}</Card.Caption>
        </Card.Column>
      </Card>
    </Pressable>
  )
}
