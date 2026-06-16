import { Fragment } from "react"
import { Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { BodyPartIconHost } from "@/entities/workout-session"
import { Card } from "@/shared/ui/Card"
import type { RoutineCycleSessionRow } from "../model/routineCycleSessionRows"

interface RoutineCycleSessionListProps {
  sessions: RoutineCycleSessionRow[]
  progress?: { current: number; total: number }
  isDeloadCycle?: boolean
  onMorePress?: () => void
  onSessionPress?: (sessionId: string) => void
  onLongPress?: () => void
}

export function RoutineCycleSessionList({
  sessions,
  progress,
  isDeloadCycle = false,
  onMorePress,
  onSessionPress,
  onLongPress,
}: RoutineCycleSessionListProps) {
  const { t } = useTranslation()
  const badgeText = progress
    ? isDeloadCycle
      ? `${progress.current}/${progress.total} · ${t("workout.routineCycle.status.deload")}`
      : `${progress.current}/${progress.total}`
    : undefined

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={450}>
      <Card variant="glass">
        <Card.Header
          label={t("summary.routineCycleSessions")}
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
                        {session.status === "completed" && (
                          <>
                            {session.isDeload ? (
                              <>
                                <Card.Dot />
                                <Card.Caption>
                                  {t("workout.routineCycle.status.deload")}
                                </Card.Caption>
                              </>
                            ) : null}
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
                        {session.status === "completed"
                          ? String(session.kcal)
                          : session.status === "deload"
                            ? t("workout.routineCycle.status.deload")
                            : t("workout.routineCycle.status.pending")}
                      </Card.Accent>
                      {session.status === "completed" && (
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
