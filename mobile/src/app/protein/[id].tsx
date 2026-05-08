import { WorkoutNavigationGuard } from "@/features/do-workout"
import { ProteinDetailScreen } from "@/features/view-protein-detail"

export default function ProteinDetailPage() {
  return (
    <>
      <WorkoutNavigationGuard />
      <ProteinDetailScreen />
    </>
  )
}
