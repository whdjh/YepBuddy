import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Switch, View } from "react-native"
import { useTranslation } from "react-i18next"
import {
  clearWorkoutPlaceRegistration,
  disableWorkoutPlaceArrivalReminder,
  getConfirmedWorkoutPlace,
  getWorkoutPlaceReminderEnabled,
  getWorkoutPlaceReminderSyncStatus,
  registerCurrentWorkoutPlace,
  setWorkoutPlaceReminderEnabled,
  syncWorkoutPlaceArrivalReminder,
  type RegisterCurrentWorkoutPlaceResult,
  type WorkoutPlaceReminderSyncStatus,
} from "@/entities/workout-session"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { Button } from "@/shared/ui/Button"
import { SettingsRow } from "./SettingsRow"

/** 운동 장소 등록과 도착 알림 ON/OFF를 관리 */
export function WorkoutPlaceArrivalReminderToggle() {
  const { t } = useTranslation()
  const accent = useResolvedColorToken(semanticColorTokens.accent)
  const muted = useResolvedColorToken(semanticColorTokens.surfaceMuted)
  const surface = useResolvedColorToken(semanticColorTokens.surface)

  const [enabled, setEnabled] = useState(false)
  const [hasPlace, setHasPlace] = useState(false)
  const [loading, setLoading] = useState(true)
  const [syncStatus, setSyncStatus] =
    useState<WorkoutPlaceReminderSyncStatus | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false

    void Promise.all([
      getWorkoutPlaceReminderEnabled(),
      getWorkoutPlaceReminderSyncStatus(),
      getConfirmedWorkoutPlace(),
    ])
      .then(([storedEnabled, storedSyncStatus, place]) => {
        if (cancelled) {
          return
        }

        const placeExists = place !== null
        setEnabled(storedEnabled && placeExists)
        setHasPlace(placeExists)
        setSyncStatus(storedSyncStatus)
        if (storedEnabled && !placeExists) {
          void disableWorkoutPlaceArrivalReminder()
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

  const refreshSyncStatus = async () => {
    setSyncStatus(await getWorkoutPlaceReminderSyncStatus().catch(() => null))
  }

  const handleToggle = async () => {
    if (updating || !hasPlace) {
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
        setEnabled(synced)
        await refreshSyncStatus()
        return
      }

      await disableWorkoutPlaceArrivalReminder()
      setEnabled(false)
      await refreshSyncStatus()
    } catch {
      setEnabled(previousEnabled)
      await setWorkoutPlaceReminderEnabled(previousEnabled).catch(
        () => undefined,
      )
    } finally {
      setUpdating(false)
    }
  }

  const getRegistrationErrorKey = (result: RegisterCurrentWorkoutPlaceResult) => {
    if (result === "permission-denied") {
      return "settings.workoutPlaceReminder.registrationPermissionDenied"
    }
    if (result === "low-accuracy") {
      return "settings.workoutPlaceReminder.registrationLowAccuracy"
    }
    return "settings.workoutPlaceReminder.registrationUnavailable"
  }

  const registerPlace = async () => {
    setUpdating(true)
    try {
      const result = await registerCurrentWorkoutPlace()
      if (result !== "registered") {
        Alert.alert(
          t("settings.workoutPlaceReminder.registrationErrorTitle"),
          t(getRegistrationErrorKey(result)),
        )
        return
      }

      setHasPlace(true)
      if (enabled) {
        await syncWorkoutPlaceArrivalReminder({ allowPrompt: false })
        await refreshSyncStatus()
      }
      Alert.alert(
        t("settings.workoutPlaceReminder.registrationSuccessTitle"),
        t("settings.workoutPlaceReminder.registrationSuccessBody"),
      )
    } catch {
      Alert.alert(
        t("settings.workoutPlaceReminder.registrationErrorTitle"),
        t("settings.workoutPlaceReminder.registrationUnavailable"),
      )
    } finally {
      setUpdating(false)
    }
  }

  const handleRegisterPress = () => {
    if (updating) {
      return
    }

    Alert.alert(
      t("settings.workoutPlaceReminder.registrationConfirmTitle"),
      t("settings.workoutPlaceReminder.registrationConfirmBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.workoutPlaceReminder.registrationConfirmAction"),
          onPress: () => void registerPlace(),
        },
      ],
      { cancelable: true },
    )
  }

  const clearPlace = async () => {
    setUpdating(true)
    try {
      await clearWorkoutPlaceRegistration()
      setEnabled(false)
      setHasPlace(false)
      await refreshSyncStatus()
    } catch {
      Alert.alert(
        t("settings.workoutPlaceReminder.registrationErrorTitle"),
        t("settings.workoutPlaceReminder.registrationUnavailable"),
      )
    } finally {
      setUpdating(false)
    }
  }

  const handleClearPress = () => {
    if (updating) {
      return
    }

    Alert.alert(
      t("settings.workoutPlaceReminder.clearConfirmTitle"),
      t("settings.workoutPlaceReminder.clearConfirmBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.workoutPlaceReminder.clearConfirmAction"),
          style: "destructive",
          onPress: () => void clearPlace(),
        },
      ],
      { cancelable: true },
    )
  }

  const statusMessage = !hasPlace
    ? t("settings.workoutPlaceReminder.statusNoPlace")
    : enabled && syncStatus && !syncStatus.operational
      ? syncStatus.reason === "permission-denied"
        ? t("settings.workoutPlaceReminder.statusPermissionDenied")
        : syncStatus.reason === "registration-failed"
          ? t("settings.workoutPlaceReminder.statusRegistrationFailed")
          : null
      : t("settings.workoutPlaceReminder.statusPlaceRegistered")
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
            disabled={updating || !hasPlace}
            accessibilityRole="switch"
            accessibilityLabel={t("settings.workoutPlaceReminder.title")}
            accessibilityHint={body}
            accessibilityState={{
              checked: enabled,
              disabled: updating || !hasPlace,
            }}
            onValueChange={() => {
              void handleToggle()
            }}
            trackColor={{ false: muted, true: accent }}
            thumbColor={surface}
          />
        )
      }
      footer={
        <View className="mt-yb-4 gap-yb-2">
          <Button
            variant="outline"
            label={t(
              hasPlace
                ? "settings.workoutPlaceReminder.changePlace"
                : "settings.workoutPlaceReminder.registerPlace",
            )}
            disabled={loading || updating}
            accessibilityRole="button"
            accessibilityState={{ busy: updating, disabled: loading || updating }}
            onPress={handleRegisterPress}
          />
          {hasPlace && (
            <Button
              variant="ghost"
              label={t("settings.workoutPlaceReminder.clearPlace")}
              disabled={updating}
              accessibilityRole="button"
              accessibilityState={{ busy: updating, disabled: updating }}
              onPress={handleClearPress}
            />
          )}
        </View>
      }
    />
  )
}
