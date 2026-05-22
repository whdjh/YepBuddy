import { useCallback, useEffect, useRef, useState } from "react"
import type { TFunction } from "i18next"
import { router } from "expo-router"
import { Alert } from "react-native"
import type { WeeklyRoutinePlanResult as RoutineCyclePlanResult } from "@/entities/workout-session"
import { acceptRoutineCycleFeaturePrompt } from "./routineCycleFeaturePromptActions"

interface UseRoutineCycleFeaturePromptParams {
  notificationPermissionRequestDone: boolean
  routineCyclePlan: RoutineCyclePlanResult
  t: TFunction
}

export function useRoutineCycleFeaturePrompt({
  notificationPermissionRequestDone,
  routineCyclePlan,
  t,
}: UseRoutineCycleFeaturePromptParams) {
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
            void routineCyclePlan.disableRoutine().finally(closeFeatureAlert)
          },
        },
        {
          text: t("workout.weeklyRoutine.featurePrompt.accept"),
          onPress: () => {
            void acceptRoutineCycleFeaturePrompt({
              enableRoutine: routineCyclePlan.enableRoutine,
              closeFeatureAlert,
              openRoutineSettings: () => {
                router.push("/settings?routineSetup=1")
              },
            })
          },
        },
      ],
      { cancelable: false },
    )
  }, [closeFeatureAlert, routineCyclePlan, t])

  const shouldShowFeatureAlert =
    notificationPermissionRequestDone &&
    routineCyclePlan.featureStatus === "unasked" &&
    !routineCyclePlan.isLoading

  useEffect(() => {
    if (shouldShowFeatureAlert) {
      showFeatureAlert()
    }
  }, [shouldShowFeatureAlert, showFeatureAlert])

  return {
    isFeatureAlertOpen,
  }
}
