import { Pressable, View } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { SymbolView } from "./SymbolView"
import { GlassSurface } from "./GlassSurface"

export function SettingsFab() {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { fg: fgColor } = useCardColors()

  return (
    <View className="absolute right-yb-5 z-20" style={{ top: insets.top + 16 }}>
      <GlassSurface
        className="h-yb-12 w-yb-12 border border-yb-glass-border"
        cornerRadius={16}
        fallbackClassName="bg-yb-glass-bg"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("settings.title")}
          className="h-yb-12 w-yb-12 items-center justify-center active:scale-[0.95]"
          onPress={() => router.push("/settings")}
        >
          <SymbolView name="gearshape.fill" size={22} tintColor={fgColor} />
        </Pressable>
      </GlassSurface>
    </View>
  )
}
