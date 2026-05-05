import { ScrollView, Text, useColorScheme, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SymbolView } from "expo-symbols"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { IconButton } from "@/shared/ui/IconButton"
import { Main } from "@/shared/ui/Main"
import { WorkoutReminderToggle } from "./WorkoutReminderToggle"

const SETTINGS_BACKGROUND_COLORS = {
  light: ["#FAF7F2", "#FAF7F2"],
  dark: ["#1C1C1E", "#1C1C1E"],
} as const

export function SettingsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const isDark = useColorScheme() === "dark"
  const fgColor =
    (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"

  return (
    <Main>
      <LinearGradient
        colors={
          isDark
            ? SETTINGS_BACKGROUND_COLORS.dark
            : SETTINGS_BACKGROUND_COLORS.light
        }
        className="absolute inset-0"
      />

      <View className="flex-row items-center gap-yb-3 px-yb-5 pt-yb-2 pb-yb-1">
        <IconButton
          accessibilityLabel={t("settings.back", {
            defaultValue: t("common.back"),
          })}
          variant="back-square"
          onPress={() => router.back()}
        >
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text
          className="text-center text-yb-heading-md text-yb-fg"
          style={{ flex: 1 }}
        >
          {t("settings.title", { defaultValue: "설정" })}
        </Text>
        <View className="w-yb-icon-btn" />
      </View>

      <ScrollView
        className="grow"
        contentContainerClassName="gap-yb-6 px-yb-5 pt-yb-4 pb-yb-30"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-yb-3">
          <Text className="text-yb-label font-semibold text-yb-fg-secondary">
            {t("settings.sections.workout", { defaultValue: "운동" })}
          </Text>
          <WorkoutReminderToggle />
        </View>

        <View className="gap-yb-3">
          <Text className="text-yb-label font-semibold text-yb-fg-secondary">
            {t("settings.sections.protein", { defaultValue: "프로틴" })}
          </Text>
        </View>
      </ScrollView>
    </Main>
  )
}
