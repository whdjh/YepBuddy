import { memo, useCallback } from "react"
import { Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { Card } from "@/shared/ui/Card"
import {
  appendCardioDurationToTitle,
  BodyPartIconHost,
} from "@/entities/workout-session"
import { formatDateWithDay, bodyPartLabel } from "@/shared/lib/format"
import type { BodyPart } from "@/entities/workout-session"

interface SessionCardProps {
  sessionId: string
  bodyParts: BodyPart[]
  cardioDurationMinutes: number | null
  isDeload: boolean
  kcal: number | null
  date: Date
  onPress: (sessionId: string) => void
}

function SessionCardComponent({
  sessionId,
  bodyParts,
  cardioDurationMinutes,
  isDeload,
  kcal,
  date,
  onPress,
}: SessionCardProps) {
  const { t } = useTranslation()
  const bodyPartLabelTextBase =
    bodyParts.length > 0
      ? bodyParts.map(bodyPartLabel).join(" + ")
      : t("workout.result.unspecified")
  const bodyPartLabelText = appendCardioDurationToTitle({
    title: bodyPartLabelTextBase,
    cardioLabel: t("workout.calendar.cardio"),
    cardioMinutes: cardioDurationMinutes,
  })
  const representativeBodyPart = bodyParts[0] ?? null
  const deloadLabel = t("workout.routineCycle.status.deload")

  const handlePress = useCallback(() => onPress(sessionId), [onPress, sessionId])

  return (
    <Pressable
      className="mb-yb-3"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${formatDateWithDay(date)} ${bodyPartLabelText}${isDeload ? ` ${deloadLabel}` : ""}`}
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
          <Card.Column alignment="trailing" spacing={2}>
            <Card.Caption size={12}>{formatDateWithDay(date)}</Card.Caption>
            {isDeload ? <Card.Accent size={12}>{deloadLabel}</Card.Accent> : null}
          </Card.Column>
        </Card.Row>
      </Card>
    </Pressable>
  )
}

export const SessionCard = memo(SessionCardComponent)
