import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { Card } from "@/shared/ui/Card"

interface WorkoutLinkCardProps {
  disabled?: boolean
  onLongPress?: () => void
}

export function WorkoutLinkCard({
  disabled = false,
  onLongPress,
}: WorkoutLinkCardProps) {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Pressable
      onPress={() => !disabled && router.push("/workout/countdown")}
      onLongPress={onLongPress}
      delayLongPress={450}
      disabled={disabled && !onLongPress}
      className={disabled ? "opacity-40" : ""}
    >
      <Card variant="glass" minHeight={200}>
        <Card.Column spacing={0}>
          <Card.Header label={t("summary.workout")} />
          <Card.Spacer size={12} />
          <Card.Icon name="play.fill" variant="lg" />
          <Card.Spacer size={10} />
          <Card.Title>{t("summary.strengthTraining")}</Card.Title>
          <Card.Spacer size={10} />
          <Card.Row spacing={4}>
            <Card.Dot variant="lg" />
            <Card.Accent size={15}>{t("summary.startWorkout")}</Card.Accent>
          </Card.Row>
        </Card.Column>
      </Card>
    </Pressable>
  )
}
