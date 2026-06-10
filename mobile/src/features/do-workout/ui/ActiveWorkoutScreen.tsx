import { useEffect } from "react"
import { router } from "expo-router"
import { useWorkout } from "@/entities/workout-session"
import { Main } from "@/shared/ui/Main"
import { ActiveWorkoutContent } from "./ActiveWorkoutContent"

export function ActiveWorkoutScreen() {
  const { isHydrated, state } = useWorkout()
  const shouldRedirectToCountdown = isHydrated && state.phase === "countdown"
  const shouldRedirectToHome =
    isHydrated && (state.phase === "idle" || state.phase === "completed")

  useEffect(() => {
    if (shouldRedirectToCountdown) {
      router.replace("/workout/countdown")
      return
    }

    if (shouldRedirectToHome) {
      router.replace("/")
    }
  }, [shouldRedirectToCountdown, shouldRedirectToHome])

  if (!isHydrated || shouldRedirectToCountdown || shouldRedirectToHome) {
    return (
      <Main className="workout-mode">
        {null}
      </Main>
    )
  }

  return <ActiveWorkoutContent />
}
