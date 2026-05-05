import { View } from "react-native"
import { SummaryScreen } from "@/features/view-summary"
import { SettingsFab } from "@/shared/ui/SettingsFab"

export default function SummaryPage() {
  return (
    <View className="h-full w-full">
      <SummaryScreen />
      <SettingsFab />
    </View>
  )
}
