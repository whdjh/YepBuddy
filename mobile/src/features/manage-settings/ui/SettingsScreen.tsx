import { ScrollView, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SymbolView } from "@/shared/ui/SymbolView"
import { IconButton } from "@/shared/ui/IconButton"
import { Main } from "@/shared/ui/Main"
import { ProteinSaleNotificationToggle } from "./ProteinSaleNotificationToggle"
import { WeeklyRoutineToggle } from "./WeeklyRoutineToggle"
import { WorkoutPlaceArrivalReminderToggle } from "./WorkoutPlaceArrivalReminderToggle"
import { WorkoutReminderToggle } from "./WorkoutReminderToggle"
import { SettingsLegalFooter } from "./SettingsLegalFooter"

export function SettingsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const bgColor = useResolvedColorToken(semanticColorTokens.bg)
  const fgColor = useResolvedColorToken(semanticColorTokens.fg)

  return (
    <Main>
      <LinearGradient
        colors={[bgColor, bgColor]}
        className="absolute inset-0"
      />

      <View className="flex-row items-center gap-yb-3 px-yb-5 pt-yb-2 pb-yb-1">
        <IconButton
          accessibilityLabel={t("settings.back")}
          variant="back-square"
          onPress={() => router.back()}
        >
          <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
        </IconButton>
        <Text
          className="text-center text-yb-heading-md text-yb-fg"
          style={{ flex: 1 }}
        >
          {t("settings.title")}
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
            {t("settings.sections.workout")}
          </Text>
          <WeeklyRoutineToggle />
          <WorkoutReminderToggle />
          <WorkoutPlaceArrivalReminderToggle />
        </View>

        <View className="gap-yb-3">
          <Text className="text-yb-label font-semibold text-yb-fg-secondary">
            {t("settings.sections.protein")}
          </Text>
          <ProteinSaleNotificationToggle />
        </View>

        <SettingsLegalFooter />
      </ScrollView>
    </Main>
  )
}
