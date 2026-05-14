import { useEffect, useState } from "react"
import { ActivityIndicator, Switch } from "react-native"
import { useTranslation } from "react-i18next"
import {
  disableWorkoutPlaceArrivalReminder,
  getWorkoutPlaceReminderEnabled,
  getWorkoutPlaceReminderSyncStatus,
  setWorkoutPlaceReminderEnabled,
  syncWorkoutPlaceArrivalReminder,
  type WorkoutPlaceReminderSyncStatus,
} from "@/entities/workout-session"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SettingsRow } from "./SettingsRow"

export function WorkoutPlaceArrivalReminderToggle() {
  const { t } = useTranslation()
  const accent = useResolvedColorToken(semanticColorTokens.accent)
  const muted = useResolvedColorToken(semanticColorTokens.surfaceMuted)
  const surface = useResolvedColorToken(semanticColorTokens.surface)

  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] =
    useState<WorkoutPlaceReminderSyncStatus | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false

    void Promise.all([
      getWorkoutPlaceReminderEnabled(),
      getWorkoutPlaceReminderSyncStatus(),
    ])
      .then(([storedEnabled, storedSyncStatus]) => {
        if (!cancelled) {
          setEnabled(storedEnabled)
          setSyncStatus(storedSyncStatus)
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleToggle = async () => {
    if (updating) {
      return
    }

    const previousEnabled = enabled
    const nextEnabled = !previousEnabled
    setUpdating(true)

    try {
      if (nextEnabled) {
        await setWorkoutPlaceReminderEnabled(true)
        const synced = await syncWorkoutPlaceArrivalReminder({
          allowPrompt: true,
        })

        if (!synced) {
          await setWorkoutPlaceReminderEnabled(false).catch(() => undefined)
        }

        setEnabled(synced)
        setSyncStatus(
          await getWorkoutPlaceReminderSyncStatus().catch(() => null),
        )
        return
      }

      await disableWorkoutPlaceArrivalReminder()
      setEnabled(false)
      setSyncStatus(
        await getWorkoutPlaceReminderSyncStatus().catch(() => null),
      )
    } catch {
      setEnabled(previousEnabled)
      await setWorkoutPlaceReminderEnabled(previousEnabled).catch(
        () => undefined,
      )
    } finally {
      setUpdating(false)
    }
  }

  const statusMessage =
    enabled && syncStatus && !syncStatus.operational
      ? syncStatus.reason === "permission-denied"
        ? t("settings.workoutPlaceReminder.statusPermissionDenied")
        : syncStatus.reason === "registration-failed"
          ? t("settings.workoutPlaceReminder.statusRegistrationFailed")
          : syncStatus.reason === "no-places"
            ? t("settings.workoutPlaceReminder.statusNoPlaces")
            : null
      : null
  const body = statusMessage
    ? `${t("settings.workoutPlaceReminder.body")}\n${statusMessage}`
    : t("settings.workoutPlaceReminder.body")

  return (
    <SettingsRow
      title={t("settings.workoutPlaceReminder.title")}
      body={body}
      control={
        loading ? (
          <ActivityIndicator color={accent} />
        ) : (
          <Switch
            value={enabled}
            disabled={updating}
            accessibilityRole="switch"
            accessibilityLabel={t("settings.workoutPlaceReminder.title")}
            accessibilityHint={t("settings.workoutPlaceReminder.body")}
            accessibilityState={{ checked: enabled, disabled: updating }}
            onValueChange={() => {
              void handleToggle()
            }}
            trackColor={{ false: muted, true: accent }}
            thumbColor={surface}
          />
        )
      }
    />
  )
}
