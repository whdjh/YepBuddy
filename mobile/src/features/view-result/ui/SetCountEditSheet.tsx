import { useEffect, useState } from "react"
import { Modal, Pressable, ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  getWorkoutBodyPartSetKey,
  getWorkoutBodyPartSetLabel,
  type WorkoutBodyPartSet,
  type WorkoutSetCountUpdate,
} from "@/entities/workout-session"
import { bodyPartDetailLabel, bodyPartLabel } from "@/shared/lib/format"
import { Button } from "@/shared/ui/Button"
import { GlassBackground } from "@/shared/ui/GlassBackground"
import { Stepper } from "@/shared/ui/Stepper"

interface SetCountEditSheetProps {
  bodyParts: WorkoutBodyPartSet[]
  isSaving: boolean
  visible: boolean
  onClose: () => void
  onSave: (updates: WorkoutSetCountUpdate[]) => void
}

export function SetCountEditSheet({
  bodyParts,
  isSaving,
  visible,
  onClose,
  onSave,
}: SetCountEditSheetProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<WorkoutSetCountUpdate[]>([])
  const [isDraftReady, setIsDraftReady] = useState(false)

  useEffect(() => {
    if (!visible) {
      setIsDraftReady(false)
      return
    }

    setDraft(
      bodyParts.map((item) => ({
        key: getWorkoutBodyPartSetKey(item),
        setCount: item.setCount,
      })),
    )
    setIsDraftReady(true)
  }, [bodyParts, visible])

  const close = () => {
    if (!isSaving) {
      onClose()
    }
  }

  const updateSetCount = (index: number, setCount: number) => {
    setDraft((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, setCount } : item,
      ),
    )
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={close}
    >
      <View className="h-full justify-end bg-yb-result-delete-overlay">
        <Pressable
          accessibilityLabel={t("common.close")}
          accessibilityRole="button"
          className="absolute inset-0"
          disabled={isSaving}
          onPress={close}
        />
        <SafeAreaView
          accessibilityViewIsModal
          className="max-h-[85%] overflow-hidden rounded-t-yb-drawer border border-yb-glass-border px-yb-5 pt-yb-3 shadow-yb-lg"
          edges={["bottom"]}
        >
          <GlassBackground cornerRadius={20} />
          <View className="mb-yb-5 h-yb-1 w-yb-12 self-center rounded-full bg-yb-glass-border" />
          <Text className="mb-yb-5 text-yb-heading-sm text-yb-fg">
            {t("workout.result.editSetsTitle")}
          </Text>

          <ScrollView
            className="shrink"
            contentContainerClassName="gap-yb-4"
            showsVerticalScrollIndicator={false}
          >
            <View
              accessibilityState={{ disabled: isSaving }}
              className={isSaving ? "gap-yb-4 opacity-40" : "gap-yb-4"}
              pointerEvents={isSaving ? "none" : "auto"}
            >
              {bodyParts.map((bodyPart, index) => (
                <Stepper
                  key={getWorkoutBodyPartSetKey(bodyPart)}
                  disabled={isSaving}
                  label={getWorkoutBodyPartSetLabel(bodyPart, {
                    bodyPartLabel,
                    bodyPartDetailLabel,
                  })}
                  min={1}
                  variant="glass"
                  unit={t("workout.result.setsUnit")}
                  value={draft[index]?.setCount ?? bodyPart.setCount}
                  onDecrement={() =>
                    updateSetCount(
                      index,
                      Math.max(
                        1,
                        (draft[index]?.setCount ?? bodyPart.setCount) - 1,
                      ),
                    )
                  }
                  onIncrement={() =>
                    updateSetCount(
                      index,
                      (draft[index]?.setCount ?? bodyPart.setCount) + 1,
                    )
                  }
                />
              ))}
            </View>
          </ScrollView>

          <View className="flex-row gap-yb-3 pb-yb-3 pt-yb-5">
            <Button
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaving }}
              className="grow basis-0"
              disabled={isSaving}
              label={t("common.cancel")}
              variant="glass"
              onPress={close}
            />
            <Button
              accessibilityRole="button"
              accessibilityState={{
                busy: isSaving,
                disabled: isSaving || !isDraftReady,
              }}
              className="grow basis-0"
              disabled={isSaving || !isDraftReady}
              label={t("common.save")}
              variant="glass"
              onPress={() => {
                if (isDraftReady) {
                  onSave(draft)
                }
              }}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}
