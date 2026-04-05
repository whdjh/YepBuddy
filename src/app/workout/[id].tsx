import { useLocalSearchParams } from "expo-router"
import { ResultScreen } from "@/features/view-result"

export default function WorkoutResultPage() {
  const { id } = useLocalSearchParams<{ id: string }>()

  return <ResultScreen sessionId={id ?? ""} />
}
