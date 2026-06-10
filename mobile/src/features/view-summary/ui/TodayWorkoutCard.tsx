import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import {
  BodyPartIconHost,
  type BodyPart,
} from "@/entities/workout-session"
import { Card } from "@/shared/ui/Card"

interface TodayWorkoutCardProps {
  bodyParts: string
  representativeBodyPart: BodyPart | null
  totalSets: number
  onLongPress?: () => void
}

export function TodayWorkoutCard({
  bodyParts,
  representativeBodyPart,
  totalSets,
  onLongPress,
}: TodayWorkoutCardProps) {
  const router = useRouter()

  const { t } = useTranslation()

  return (
    <Pressable
      onPress={() => router.push("/calendar")}
      onLongPress={onLongPress}
      delayLongPress={450}
    >
      <Card variant="glass" minHeight={130}>
        <Card.Row spacing={16}>
          <BodyPartIconHost bodyPart={representativeBodyPart} size="xl" />
          <Card.Column alignment="leading" spacing={4}>
            <Card.Label>{t("summary.todayWorkout")}</Card.Label>
            <Card.Title size={22}>{bodyParts}</Card.Title>
            <Card.Accent size={22}>{`${totalSets}${t("summary.setsUnit")}`}</Card.Accent>
          </Card.Column>
          <Card.Spacer />
          <Card.Chevron />
        </Card.Row>
      </Card>
    </Pressable>
  )
}
