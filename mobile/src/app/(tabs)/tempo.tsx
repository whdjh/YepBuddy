import { router, useLocalSearchParams } from "expo-router"
import { TempoScreen } from "@/features/use-tempo"

export default function TempoPage() {
  const { fromWorkout } = useLocalSearchParams<{ fromWorkout?: string }>()

  return (
    <TempoScreen
      showBackButton={fromWorkout === "1"}
      onBackPress={() => router.replace("/workout/active")}
    />
  )
}
