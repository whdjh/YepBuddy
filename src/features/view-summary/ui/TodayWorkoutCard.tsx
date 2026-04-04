import { Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { Card } from "@/shared/ui/Card"

interface TodayWorkoutCardProps {
  bodyParts: string
  totalSets: number
  targetSets: number
}

export function TodayWorkoutCard({ bodyParts, totalSets, targetSets }: TodayWorkoutCardProps) {
  const router = useRouter()

  const { t } = useTranslation()

  return (
    <Pressable onPress={() => router.push("/calendar")}>
      <Card variant="glass" minHeight={130}>
        <Card.Row spacing={16}>
          <Card.Gauge current={totalSets} target={targetSets}>
            <Card.Title size={24} design="rounded">{String(totalSets)}</Card.Title>
          </Card.Gauge>
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
