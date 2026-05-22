import { Modal, Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import type { WeeklyRoutinePlanResult as RoutineCyclePlanResult } from "@/entities/workout-session"

interface RoutineCycleSetupPromptModalProps {
  plan: RoutineCyclePlanResult
  visible: boolean
}

export function RoutineCycleSetupPromptModal({
  plan,
  visible,
}: RoutineCycleSetupPromptModalProps) {
  const { t } = useTranslation()
  const kind = plan.setupPromptKind

  if (!kind) {
    return null
  }

  const handlePrimaryPress = () => {
    void plan.restartCurrentCycle()
  }

  const handleDismiss = () => {
    void plan.dismissSetupPrompt()
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleDismiss}
    >
      <View className="absolute inset-0 justify-center bg-black/35 px-yb-6">
        <Pressable className="absolute inset-0" onPress={handleDismiss} />
        <View className="rounded-yb-xl border border-yb-border bg-yb-surface p-yb-6">
          <Text className="text-yb-title font-semibold text-yb-fg">
            {t(`workout.weeklyRoutine.prompt.${kind}.title`)}
          </Text>
          <Text className="mt-yb-2 text-yb-body-sm text-yb-fg-secondary">
            {t(`workout.weeklyRoutine.prompt.${kind}.body`)}
          </Text>
          <View className="mt-yb-5 flex-row gap-yb-2">
            <Pressable
              className="grow items-center rounded-yb-md bg-yb-accent px-yb-4 py-yb-3"
              onPress={handlePrimaryPress}
            >
              <Text className="text-yb-body-sm font-semibold text-yb-on-accent">
                {t(`workout.weeklyRoutine.prompt.${kind}.action`)}
              </Text>
            </Pressable>
            <Pressable
              className="items-center rounded-yb-md border border-yb-border px-yb-4 py-yb-3"
              onPress={handleDismiss}
            >
              <Text className="text-yb-body-sm font-semibold text-yb-fg-secondary">
                {t("workout.weeklyRoutine.prompt.dismiss")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}
