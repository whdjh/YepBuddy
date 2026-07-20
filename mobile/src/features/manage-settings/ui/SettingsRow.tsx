import type { ReactNode } from "react"
import { Text, View } from "react-native"
import { GlassSurface } from "@/shared/ui/GlassSurface"

interface SettingsRowProps {
  /** 설정 항목 제목 */
  title: string
  /** 설정 항목 설명 */
  body: string
  /** 우측 제어 UI */
  control: ReactNode
  /** 기본 행 아래에 표시할 추가 UI */
  footer?: ReactNode
}

/** 제목, 설명, 제어 UI를 공통 카드 형태로 표시 */
export function SettingsRow({ title, body, control, footer }: SettingsRowProps) {
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
      {footer}
    </GlassSurface>
  )
}
