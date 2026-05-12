import { WorkoutNavigationGuard } from "@/features/do-workout/ui/WorkoutNavigationGuard"
import { SessionListScreen } from "@/features/view-sessions/ui/SessionListScreen"

export default function SessionsPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <SessionListScreen />
    </>
  )
}
