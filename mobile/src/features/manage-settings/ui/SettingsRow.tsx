import type { ReactNode } from "react"
import { Text, View } from "react-native"
import { GlassSurface } from "@/shared/ui/GlassSurface"

interface SettingsRowProps {
  title: string
  body: string
  control: ReactNode
}

export function SettingsRow({ title, body, control }: SettingsRowProps) {
  return (
    <GlassSurface
      className="border border-yb-glass-border"
      cornerRadius={12}
      paddingSize={16}
      fallbackClassName="bg-yb-glass-bg"
    >
      <View className="flex-row items-center gap-yb-3">
        <View className="shrink grow">
          <Text className="text-yb-body-lg font-semibold text-yb-fg">
            {title}
          </Text>
          <Text className="mt-yb-1 text-yb-caption text-yb-fg-secondary">
            {body}
          </Text>
        </View>
        {control}
      </View>
    </GlassSurface>
  )
}
