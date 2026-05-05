import { useEffect, useState } from "react"
import { ActivityIndicator, Switch, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { GlassSurface } from "@/shared/ui/GlassSurface"
import {
  disableProteinSaleNotifications,
  getProteinSaleNotificationEnabled,
  scheduleProteinSaleNotifications,
} from "@/shared/lib/protein-sale-notification"

export function ProteinSaleNotificationToggle() {
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
        })
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
    <GlassSurface
      className="mx-yb-5 mt-yb-4 border border-yb-glass-border"
      cornerRadius={16}
      paddingSize={16}
      fallbackClassName="bg-yb-glass-bg"
    >
      <View className="flex-row items-center gap-yb-3">
        <View className="shrink grow">
          <Text className="text-yb-body-lg font-semibold text-yb-fg">
            {t("protein.saleNotifications.toggleTitle")}
          </Text>
          <Text className="mt-yb-1 text-yb-caption text-yb-fg-secondary">
            {t("protein.saleNotifications.toggleBody")}
          </Text>
        </View>
        {loading ? (
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
        )}
      </View>
    </GlassSurface>
  )
}
