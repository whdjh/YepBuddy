import { useEffect, useState } from "react"
import { ActivityIndicator, Switch, View } from "react-native"
import { useTranslation } from "react-i18next"
import {
  deleteWorkoutPlace,
  disableWorkoutPlaceArrivalReminder,
  getWorkoutPlaceReminderEnabled,
  getWorkoutPlaceReminderSyncStatus,
  getWorkoutPlaces,
  refreshWorkoutPlaceLabels,
  rebuildAndSyncWorkoutPlaceArrivalReminder,
  setWorkoutPlaceReminderEnabled,
  type LearnedWorkoutPlace,
  type WorkoutPlaceReminderSyncStatus,
} from "@/entities/workout-session"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { Button } from "@/shared/ui/Button"
import { SettingsRow } from "./SettingsRow"
import { WorkoutPlaceListSheet } from "./WorkoutPlaceListSheet"

/** 자동 학습 장소 목록과 도착 알림 ON/OFF를 관리 */
export function WorkoutPlaceArrivalReminderToggle() {
  const { t } = useTranslation()
  const accent = useResolvedColorToken(semanticColorTokens.accent)
  const muted = useResolvedColorToken(semanticColorTokens.surfaceMuted)
  const surface = useResolvedColorToken(semanticColorTokens.surface)

  const [deletingPlaceId, setDeletingPlaceId] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [places, setPlaces] = useState<LearnedWorkoutPlace[]>([])
  const [syncStatus, setSyncStatus] =
    useState<WorkoutPlaceReminderSyncStatus | null>(null)
  const [updating, setUpdating] = useState(false)

  const loadState = async () => {
    const [storedEnabled, storedSyncStatus, storedPlaces] = await Promise.all([
      getWorkoutPlaceReminderEnabled(),
      getWorkoutPlaceReminderSyncStatus(),
      refreshWorkoutPlaceLabels(),
    ])
    setEnabled(storedEnabled && storedPlaces.length > 0)
    setPlaces(storedPlaces)
    setSyncStatus(storedSyncStatus)
    if (storedEnabled && storedPlaces.length === 0) {
      await disableWorkoutPlaceArrivalReminder()
    }
  }

  useEffect(() => {
    let cancelled = false

    void Promise.all([
      getWorkoutPlaceReminderEnabled(),
      getWorkoutPlaceReminderSyncStatus(),
      getWorkoutPlaces(),
    ])
      .then(([storedEnabled, storedSyncStatus, storedPlaces]) => {
        if (cancelled) {
          return
        }
        setEnabled(storedEnabled && storedPlaces.length > 0)
        setPlaces(storedPlaces)
        setSyncStatus(storedSyncStatus)
        if (storedEnabled && storedPlaces.length === 0) {
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
    if (updating || places.length === 0) {
      return
    }

    const previousEnabled = enabled
    const nextEnabled = !previousEnabled
    setUpdating(true)

    try {
      if (nextEnabled) {
        await setWorkoutPlaceReminderEnabled(true)
        const synced = await rebuildAndSyncWorkoutPlaceArrivalReminder({
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

  const openPlaces = () => {
    if (loading || updating) {
      return
    }
    setIsSheetOpen(true)
    setUpdating(true)
    void loadState()
      .catch(() => undefined)
      .finally(() => setUpdating(false))
  }

  const deletePlace = async (place: LearnedWorkoutPlace) => {
    setDeletingPlaceId(place.id)
    try {
      const nextPlaces = await deleteWorkoutPlace(place.id)
      setPlaces(nextPlaces)
      if (nextPlaces.length === 0) {
        setEnabled(false)
      }
      await refreshSyncStatus()
    } finally {
      setDeletingPlaceId(null)
    }
  }

  const hasPlaces = places.length > 0
  const statusMessage = !hasPlaces
    ? t("settings.workoutPlaceReminder.statusNoPlace")
    : enabled && syncStatus && !syncStatus.operational
      ? syncStatus.reason === "permission-denied"
        ? t("settings.workoutPlaceReminder.statusPermissionDenied")
        : syncStatus.reason === "registration-failed"
          ? t("settings.workoutPlaceReminder.statusRegistrationFailed")
          : null
      : t("settings.workoutPlaceReminder.statusPlaceCount", {
          count: places.length,
        })
  const body = statusMessage
    ? `${t("settings.workoutPlaceReminder.body")}\n${statusMessage}`
    : t("settings.workoutPlaceReminder.body")

  return (
    <>
      <SettingsRow
        title={t("settings.workoutPlaceReminder.title")}
        body={body}
        control={
          loading ? (
            <ActivityIndicator color={accent} />
          ) : (
            <Switch
              value={enabled}
              disabled={updating || !hasPlaces}
              accessibilityRole="switch"
              accessibilityLabel={t("settings.workoutPlaceReminder.title")}
              accessibilityHint={body}
              accessibilityState={{
                checked: enabled,
                disabled: updating || !hasPlaces,
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
          <View className="mt-yb-4">
            <Button
              variant="outline"
              label={t("settings.workoutPlaceReminder.openPlaceList", {
                count: places.length,
              })}
              disabled={loading || updating}
              accessibilityRole="button"
              accessibilityState={{
                busy: updating,
                disabled: loading || updating,
              }}
              onPress={openPlaces}
            />
          </View>
        }
      />
      <WorkoutPlaceListSheet
        deletingPlaceId={deletingPlaceId}
        places={places}
        visible={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onDelete={deletePlace}
      />
    </>
  )
}
