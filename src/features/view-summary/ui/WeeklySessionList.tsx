import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { Card } from "@/shared/ui/Card"

interface SessionData {
  sessionId: string
  bodyPart: string
  day: string
  durationMin: number
  sets: number
  kcal: number | string
}

interface WeeklySessionListProps {
  sessions: SessionData[]
  onMorePress?: () => void
  onSessionPress?: (sessionId: string) => void
}

export function WeeklySessionList({
  sessions,
  onMorePress,
  onSessionPress,
}: WeeklySessionListProps) {
  const { t } = useTranslation()

  return (
    <Card variant="glass">
      <Card.Header
        label={t("summary.thisWeekSessions")}
        more={t("summary.moreLink")}
        chevron
        onMorePress={onMorePress}
      />
      <Card.Spacer size={12} />

      {sessions.length === 0 && (
        <Card.Caption>{t("workout.result.noData")}</Card.Caption>
      )}

      {sessions.map((session, index) => (
        <Fragment key={session.sessionId}>
          {index > 0 && <Card.Divider />}
          <Card.Row spacing={12} paddingVertical={10} minHeight={48}>
            <Card.Icon name="dumbbell.fill" size={18} bgSize={40} cornerRadius={8} />
            <Card.Column alignment="leading" spacing={2}>
              <Card.Title>{session.bodyPart}</Card.Title>
              <Card.Row spacing={4}>
                <Card.Caption>{session.day}</Card.Caption>
                <Card.Dot />
                <Card.Caption>{`${session.durationMin}${t("summary.minuteUnit")}`}</Card.Caption>
                <Card.Dot />
                <Card.Caption>{`${session.sets}${t("summary.setsUnit")}`}</Card.Caption>
              </Card.Row>
            </Card.Column>
            <Card.Spacer />
            <Card.Column alignment="trailing" spacing={2}>
              <Card.Accent size={15}>{String(session.kcal)}</Card.Accent>
              <Card.Caption size={11}>{t("summary.kcalUnit")}</Card.Caption>
            </Card.Column>
            <Card.Chevron
              size={16}
              onPress={
                onSessionPress
                  ? () => onSessionPress(session.sessionId)
                  : undefined
              }
            />
          </Card.Row>
        </Fragment>
      ))}
    </Card>
  )
}
