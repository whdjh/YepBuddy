import { WorkoutNavigationGuard } from "@/entities/workout-session"
import { CalendarScreen } from "@/features/view-calendar"

export default function CalendarPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <CalendarScreen />
    </>
  )
}
