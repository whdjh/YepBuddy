import { WorkoutNavigationGuard } from "@/entities/workout-session"
import { SessionListScreen } from "@/features/view-sessions"

export default function SessionsPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <SessionListScreen />
    </>
  )
}
