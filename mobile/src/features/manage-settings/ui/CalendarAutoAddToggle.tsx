import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Linking, Switch } from "react-native"
import { useTranslation } from "react-i18next"
import {
  getCalendarAutoAddPreference,
  requestCalendarEventWritePermission,
  setCalendarAutoAddPreference,
} from "@/entities/workout-session"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SettingsRow } from "./SettingsRow"

export function CalendarAutoAddToggle() {
  const { t } = useTranslation()
  const accent = useResolvedColorToken(semanticColorTokens.accent)
  const muted = useResolvedColorToken(semanticColorTokens.surfaceMuted)
  const surface = useResolvedColorToken(semanticColorTokens.surface)

  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false

    void getCalendarAutoAddPreference()
      .then((preference) => {
        if (!cancelled) {
          setEnabled(preference === "enabled")
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
      if (!nextEnabled) {
        await setCalendarAutoAddPreference("disabled")
        setEnabled(false)
        return
      }

      const granted = await requestCalendarEventWritePermission()
      if (!granted) {
        await setCalendarAutoAddPreference("disabled")
        setEnabled(false)
        Alert.alert(
          t("settings.calendarAutoAdd.permissionDeniedTitle"),
          t("settings.calendarAutoAdd.permissionDeniedBody"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("settings.calendarAutoAdd.openSettings"),
              onPress: () => void Linking.openSettings(),
            },
          ],
        )
        return
      }

      await setCalendarAutoAddPreference("enabled")
      setEnabled(true)
    } catch {
      setEnabled(previousEnabled)
      await setCalendarAutoAddPreference(
        previousEnabled ? "enabled" : "disabled",
      ).catch(() => undefined)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <SettingsRow
      title={t("settings.calendarAutoAdd.title")}
      body={t("settings.calendarAutoAdd.body")}
      control={
        loading ? (
          <ActivityIndicator color={accent} />
        ) : (
          <Switch
            value={enabled}
            disabled={updating}
            accessibilityRole="switch"
            accessibilityLabel={t("settings.calendarAutoAdd.title")}
            accessibilityHint={t("settings.calendarAutoAdd.body")}
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
