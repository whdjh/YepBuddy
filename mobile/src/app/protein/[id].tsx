import { WorkoutNavigationGuard } from "@/entities/workout-session"
import { ProteinDetailScreen } from "@/features/view-protein-detail"

export default function ProteinDetailPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <ProteinDetailScreen />
    </>
  )
}
