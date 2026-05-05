import { useEffect, useState } from "react"
import { ActivityIndicator, Switch } from "react-native"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import {
  getWorkoutReminderEnabled,
  setWorkoutReminderEnabled,
  syncWorkoutReminderAtNight,
} from "@/entities/workout-session"
import { SettingsRow } from "./SettingsRow"

export function WorkoutReminderToggle() {
  const { t } = useTranslation()
  const accent =
    (useUnstableNativeVariable("--yb-accent") as unknown as string) || "#9B7E56"
  const muted =
    (useUnstableNativeVariable("--yb-surface-muted") as unknown as string) ||
    "#EDE4D6"
  const surface =
    (useUnstableNativeVariable("--yb-surface") as unknown as string) || "#FFFFFF"

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

    const nextEnabled = !enabled
    setUpdating(true)

    try {
      if (nextEnabled) {
        await setWorkoutReminderEnabled(true)
        const synced = await syncWorkoutReminderAtNight({
          allowPrompt: true,
        }).catch(() => false)
        if (!synced) {
          await setWorkoutReminderEnabled(false).catch(() => undefined)
        }
        setEnabled(synced)
        return
      }

      await setWorkoutReminderEnabled(false)
      await syncWorkoutReminderAtNight({ allowPrompt: false })
      setEnabled(false)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <SettingsRow
      title={t("settings.workoutReminder.title", {
        defaultValue: "운동 리마인더",
      })}
      body={t("settings.workoutReminder.body", {
        defaultValue: "운동을 기록하지 않은 날 22:00에 한 번 알려드릴게요.",
      })}
      control={
        loading ? (
          <ActivityIndicator color={accent} />
        ) : (
          <Switch
            value={enabled}
            disabled={updating}
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
