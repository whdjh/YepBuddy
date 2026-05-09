import { useCallback, useEffect, useRef, useState } from "react"
import type { TFunction } from "i18next"
import { router } from "expo-router"
import { Alert } from "react-native"
import type { WeeklyRoutinePlanResult } from "@/entities/workout-session"

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
  const [isFeatureAlertOpen, setIsFeatureAlertOpen] = useState(false)
  const isFeatureAlertOpenRef = useRef(false)

  const closeFeatureAlert = useCallback(() => {
    isFeatureAlertOpenRef.current = false
    setIsFeatureAlertOpen(false)
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
            router.push("/settings?routineSetup=1")
          },
        },
      ],
      { cancelable: false },
    )
  }, [closeFeatureAlert, t, weeklyRoutinePlan])

  const shouldShowFeatureAlert =
    notificationPermissionRequestDone &&
    weeklyRoutinePlan.featureStatus === "unasked" &&
    !weeklyRoutinePlan.isLoading

  useEffect(() => {
    if (shouldShowFeatureAlert) {
      showFeatureAlert()
    }
  }, [shouldShowFeatureAlert, showFeatureAlert])

  return {
    isFeatureAlertOpen,
  }
}
