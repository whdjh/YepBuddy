import { useEffect } from "react"
import { usePathname, useRouter } from "expo-router"
import { useWorkout } from "@/entities/workout-session/model/WorkoutContext"

const ACTIVE_WORKOUT_ALLOWED_PATHS = new Set(["/workout/active", "/tempo"])

export function WorkoutNavigationGuard() {
  const { isHydrated, state } = useWorkout()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const isRecoverable =
      state.phase === "recording" || state.phase === "paused"

    if (isRecoverable && !ACTIVE_WORKOUT_ALLOWED_PATHS.has(pathname)) {
      router.replace("/workout/active")
    }
  }, [isHydrated, pathname, router, state.phase])

  return null
}
