import { useLocalSearchParams } from "expo-router"
import { ResultScreen } from "@/features/view-result/ui/ResultScreen"

export default function WorkoutResultPage() {
  const { id, fromWorkout } = useLocalSearchParams<{
    id: string
    fromWorkout?: string
  }>()

  return (
    <ResultScreen
      sessionId={typeof id === "string" ? decodeURIComponent(id) : ""}
      fromWorkout={fromWorkout === "1"}
    />
  )
}
