import { WorkoutNavigationGuard } from "@/features/do-workout/ui/WorkoutNavigationGuard"
import { ProteinDetailScreen } from "@/features/view-protein-detail/ui/ProteinDetailScreen"

export default function ProteinDetailPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <ProteinDetailScreen />
    </>
  )
}
