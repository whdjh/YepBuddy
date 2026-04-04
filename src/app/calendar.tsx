import { Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import Svg, { Path } from "react-native-svg"
import { Main } from "@/shared/ui/Main"
import { IconButton } from "@/shared/ui/IconButton"

export default function CalendarPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const fgColor = (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"

  return (
    <Main>
      <View className="flex-row items-center px-yb-5 pt-yb-2 pb-yb-4 gap-yb-3">
        <IconButton variant="back-square" onPress={() => router.back()}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M15 19l-7-7 7-7" stroke={fgColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </IconButton>
        <Text className="text-yb-fg text-yb-title">{t("calendar.title")}</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-yb-fg-secondary text-yb-body-md">{t("calendar.title")}</Text>
      </View>
    </Main>
  )
}
