import { WorkoutNavigationGuard } from "@/features/do-workout"
import { CalendarScreen } from "@/features/view-calendar"

export default function CalendarPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <CalendarScreen />
    </>
  )
}
