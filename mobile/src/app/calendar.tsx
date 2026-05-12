import { WorkoutNavigationGuard } from "@/features/do-workout/ui/WorkoutNavigationGuard"
import { CalendarScreen } from "@/features/view-calendar/ui/CalendarScreen"

export default function CalendarPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <CalendarScreen />
    </>
  )
}
