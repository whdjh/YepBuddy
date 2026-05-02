import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"

interface WeeklyRoutineFeaturePromptModalProps {
  visible: boolean
  onAccept: () => void
  onDecline: () => void
}

export function WeeklyRoutineFeaturePromptModal({
  visible,
  onAccept,
  onDecline,
}: WeeklyRoutineFeaturePromptModalProps) {
  const { t } = useTranslation()

  if (!visible) {
    return null
  }

  return (
    <View className="absolute inset-0 z-50 justify-center bg-black/35 px-yb-6">
      <Pressable className="absolute inset-0" onPress={onDecline} />
      <View className="rounded-yb-xl border border-yb-border bg-yb-surface p-yb-6">
        <Text className="text-yb-title font-semibold text-yb-fg">
          {t("workout.weeklyRoutine.featurePrompt.title")}
        </Text>
        <View className="mt-yb-5 flex-row gap-yb-2">
          <Pressable
            className="grow items-center rounded-yb-md bg-yb-accent px-yb-4 py-yb-3"
            onPress={onAccept}
          >
            <Text className="text-yb-body-sm font-semibold text-yb-on-accent">
              {t("workout.weeklyRoutine.featurePrompt.accept")}
            </Text>
          </Pressable>
          <Pressable
            className="grow items-center rounded-yb-md border border-yb-border px-yb-4 py-yb-3"
            onPress={onDecline}
          >
            <Text className="text-yb-body-sm font-semibold text-yb-fg-secondary">
              {t("workout.weeklyRoutine.featurePrompt.decline")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
