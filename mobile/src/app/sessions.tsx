import { WorkoutNavigationGuard } from "@/features/do-workout"
import { SessionListScreen } from "@/features/view-sessions"

export default function SessionsPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <SessionListScreen />
    </>
  )
}
