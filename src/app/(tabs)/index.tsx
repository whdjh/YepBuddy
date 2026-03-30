import { Text } from "react-native"
import { useRouter } from "expo-router"
import { Button } from "@/shared/ui/Button"
import { Main } from "@/shared/ui/Main"

export default function SummaryPage() {
  const router = useRouter()

  return (
    <Main className="items-center justify-center gap-yb-4">
      <Text className="text-yb-fg text-yb-body-lg">메인화면 (요약)</Text>
      <Button
        variant="primary"
        label="운동 시작"
        onPress={() => router.push("/workout/countdown")}
      />
    </Main>
  )
}
