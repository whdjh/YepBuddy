import { useEffect, useState } from "react"
import { ActivityIndicator, Switch } from "react-native"
import { useTranslation } from "react-i18next"
import {
  disableProteinSaleNotifications,
  getProteinSaleNotificationEnabled,
  scheduleProteinSaleNotifications,
} from "@/shared/lib/protein-sale-notification"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SettingsRow } from "./SettingsRow"

export function ProteinSaleNotificationToggle() {
  const { t } = useTranslation()
  const accent = useResolvedColorToken(semanticColorTokens.accent)
  const muted = useResolvedColorToken(semanticColorTokens.surfaceMuted)
  const surface = useResolvedColorToken(semanticColorTokens.surface)

  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false

    void getProteinSaleNotificationEnabled()
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
        const scheduled = await scheduleProteinSaleNotifications({
          allowPrompt: true,
        }).catch(() => false)
        setEnabled(scheduled)
        return
      }

      await disableProteinSaleNotifications()
      setEnabled(false)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <SettingsRow
      title={t("protein.saleNotifications.toggleTitle")}
      body={t("protein.saleNotifications.toggleBody")}
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
