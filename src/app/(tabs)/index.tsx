import { Text, View } from "react-native"
import { useRouter } from "expo-router"
import { Button } from "@/shared/ui/Button"

export default function SummaryPage() {
  const router = useRouter()

  return (
    <View className="h-full w-full bg-yb-bg items-center justify-center gap-yb-4">
      <Text className="text-yb-fg text-yb-body-lg">메인화면 (요약)</Text>
      <Button
        variant="primary"
        label="운동 시작"
        onPress={() => router.push("/workout/countdown")}
      />
    </View>
  )
}
