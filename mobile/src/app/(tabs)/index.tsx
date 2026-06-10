import { useState } from "react"
import { View } from "react-native"
import { SummaryScreen } from "@/features/view-summary/ui/SummaryScreen"
import { SettingsFab } from "@/shared/ui/SettingsFab"

export default function SummaryPage() {
  const [isSummaryEditing, setIsSummaryEditing] = useState(false)

  return (
    <View className="h-full w-full">
      <SummaryScreen onEditingChange={setIsSummaryEditing} />
      {!isSummaryEditing && <SettingsFab />}
    </View>
  )
}
