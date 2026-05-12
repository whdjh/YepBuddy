import { router, useLocalSearchParams } from "expo-router"
import { View } from "react-native"
import { TempoScreen } from "@/features/use-tempo/ui/TempoScreen"
import { SettingsFab } from "@/shared/ui/SettingsFab"

export default function TempoPage() {
  const { fromWorkout } = useLocalSearchParams<{ fromWorkout?: string }>()
  const isFromWorkout = fromWorkout === "1"

  return (
    <View className="h-full w-full">
      <TempoScreen
        showBackButton={isFromWorkout}
        onBackPress={() => router.replace("/workout/active")}
      />
      {!isFromWorkout && <SettingsFab />}
    </View>
  )
}
