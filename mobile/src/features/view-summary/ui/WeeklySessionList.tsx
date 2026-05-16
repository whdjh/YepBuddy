import { Fragment } from "react"
import { Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { BodyPartIconHost } from "@/entities/workout-session/ui/BodyPartIcon"
import { Card } from "@/shared/ui/Card"
import type { WeeklySessionRow } from "../model/weeklySessionRows"

interface WeeklySessionListProps {
  sessions: WeeklySessionRow[]
  progress?: { current: number; total: number }
  onMorePress?: () => void
  onSessionPress?: (sessionId: string) => void
  onLongPress?: () => void
}

export function WeeklySessionList({
  sessions,
  progress,
  onMorePress,
  onSessionPress,
  onLongPress,
}: WeeklySessionListProps) {
  const { t } = useTranslation()
  const badgeText = progress ? `${progress.current}/${progress.total}` : undefined

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={450}>
      <Card variant="glass">
        <Card.Header
          label={t("summary.thisWeekSessions")}
          badge={badgeText}
          chevron
          onMorePress={onMorePress}
        />

        {sessions.length === 0 ? (
          <Card.Row paddingVertical={16}>
            <Card.Spacer />
            <Card.Caption>{t("workout.result.noData")}</Card.Caption>
            <Card.Spacer />
          </Card.Row>
        ) : (
          <>
            <Card.Spacer size={12} />

            {sessions.map((session, index) => {
              const sessionId = session.sessionId

              return (
                <Fragment key={session.id}>
                  {index > 0 && <Card.Divider />}
                  <Card.Row spacing={12} paddingVertical={10} minHeight={48}>
                    {session.representativeBodyPart ? (
                      <BodyPartIconHost bodyPart={session.representativeBodyPart} size="sm" />
                    ) : (
                      <Card.Icon name="dumbbell.fill" variant="sm" />
                    )}
                    <Card.Column alignment="leading" spacing={2}>
                      <Card.Title>{session.bodyPart}</Card.Title>
                      <Card.Row spacing={4}>
                        <Card.Caption>{session.day}</Card.Caption>
                        {session.status !== "planned" && (
                          <>
                            <Card.Dot />
                            <Card.Caption>{`${session.durationMin}${t("summary.minuteUnit")}`}</Card.Caption>
                            <Card.Dot />
                            <Card.Caption>{`${session.sets}${t("summary.setsUnit")}`}</Card.Caption>
                          </>
                        )}
                      </Card.Row>
                    </Card.Column>
                    <Card.Spacer />
                    <Card.Column alignment="trailing" spacing={2}>
                      <Card.Accent size={15}>
                        {session.status === "planned"
                          ? t("workout.weeklyRoutine.status.pending")
                          : String(session.kcal)}
                      </Card.Accent>
                      {session.status !== "planned" && (
                        <Card.Caption size={11}>{t("summary.kcalUnit")}</Card.Caption>
                      )}
                    </Card.Column>
                    {sessionId && (
                      <Card.Chevron
                        variant="sm"
                        onPress={
                          onSessionPress
                            ? () => onSessionPress(sessionId)
                            : undefined
                        }
                      />
                    )}
                  </Card.Row>
                </Fragment>
              )
            })}
          </>
        )}
      </Card>
    </Pressable>
  )
}
