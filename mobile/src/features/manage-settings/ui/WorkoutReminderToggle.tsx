import { useEffect, useState } from "react"
import { ActivityIndicator, Switch } from "react-native"
import { useTranslation } from "react-i18next"
import {
  getWorkoutReminderEnabled,
  setWorkoutReminderEnabled,
  syncWorkoutReminderAtNight,
} from "@/entities/workout-session"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SettingsRow } from "./SettingsRow"

export function WorkoutReminderToggle() {
  const { t } = useTranslation()
  const accent = useResolvedColorToken(semanticColorTokens.accent)
  const muted = useResolvedColorToken(semanticColorTokens.surfaceMuted)
  const surface = useResolvedColorToken(semanticColorTokens.surface)

  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false

    void getWorkoutReminderEnabled()
      .then((storedEnabled) => {
        if (!cancelled) {
          setEnabled(storedEnabled)
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
        await setWorkoutReminderEnabled(true)
        const synced = await syncWorkoutReminderAtNight({ allowPrompt: true })
        if (!synced) {
          await setWorkoutReminderEnabled(false).catch(() => undefined)
        }
        setEnabled(synced)
        return
      }

      await setWorkoutReminderEnabled(false)
      await syncWorkoutReminderAtNight({ allowPrompt: false })
      setEnabled(false)
    } catch {
      setEnabled(previousEnabled)
      await setWorkoutReminderEnabled(previousEnabled).catch(() => undefined)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <SettingsRow
      title={t("settings.workoutReminder.title")}
      body={t("settings.workoutReminder.body")}
      control={
        loading ? (
          <ActivityIndicator color={accent} />
        ) : (
          <Switch
            value={enabled}
            disabled={updating}
            accessibilityRole="switch"
            accessibilityLabel={t("settings.workoutReminder.title")}
            accessibilityHint={t("settings.workoutReminder.body")}
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
