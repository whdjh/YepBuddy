import { View } from "react-native"
import { ProteinListScreen } from "@/features/view-proteins"
import { SettingsFab } from "@/shared/ui/SettingsFab"

export default function ProteinPage() {
  return (
    <View className="h-full w-full">
      <ProteinListScreen />
      <SettingsFab />
    </View>
  )
}
