import { useCallback, useEffect, useRef, useState } from "react"
import type { TFunction } from "i18next"
import { Alert } from "react-native"
import type { WeeklyRoutinePlanResult } from "./useWeeklyRoutinePlan"

interface UseWeeklyRoutineFeaturePromptParams {
  notificationPermissionRequestDone: boolean
  weeklyRoutinePlan: WeeklyRoutinePlanResult
  t: TFunction
}

export function useWeeklyRoutineFeaturePrompt({
  notificationPermissionRequestDone,
  weeklyRoutinePlan,
  t,
}: UseWeeklyRoutineFeaturePromptParams) {
  // 루틴 안내/설정 노출 상태
  const [isFeatureAlertOpen, setIsFeatureAlertOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const isFeatureAlertOpenRef = useRef(false)

  // 루틴 안내 닫기
  const closeFeatureAlert = useCallback(() => {
    isFeatureAlertOpenRef.current = false
    setIsFeatureAlertOpen(false)
  }, [])

  // 루틴 설정 열기/닫기
  const openSettings = useCallback(() => {
    setIsSettingsOpen(true)
  }, [])

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  const showFeatureAlert = useCallback(() => {
    if (isFeatureAlertOpenRef.current) {
      return
    }

    isFeatureAlertOpenRef.current = true
    setIsFeatureAlertOpen(true)
    Alert.alert(
      t("workout.weeklyRoutine.featurePrompt.title"),
      undefined,
      [
        {
          text: t("workout.weeklyRoutine.featurePrompt.decline"),
          style: "cancel",
          onPress: () => {
            void weeklyRoutinePlan.disableRoutine().finally(closeFeatureAlert)
          },
        },
        {
          text: t("workout.weeklyRoutine.featurePrompt.accept"),
          onPress: () => {
            closeFeatureAlert()
            openSettings()
          },
        },
      ],
      { cancelable: false },
    )
  }, [closeFeatureAlert, openSettings, t, weeklyRoutinePlan])

  // 최초 루틴 안내 조건
  const shouldShowFeatureAlert =
    notificationPermissionRequestDone &&
    weeklyRoutinePlan.featureStatus === "unasked" &&
    !weeklyRoutinePlan.isLoading &&
    !isSettingsOpen

  useEffect(() => {
    if (shouldShowFeatureAlert) {
      showFeatureAlert()
    }
  }, [shouldShowFeatureAlert, showFeatureAlert])

  const handleRoutineTogglePress = useCallback(() => {
    if (weeklyRoutinePlan.isRoutineEnabled) {
      void weeklyRoutinePlan.disableRoutine()
      return
    }

    showFeatureAlert()
  }, [showFeatureAlert, weeklyRoutinePlan])

  return {
    isFeatureAlertOpen,
    isSettingsOpen,
    closeSettings,
    handleRoutineTogglePress,
  }
}
