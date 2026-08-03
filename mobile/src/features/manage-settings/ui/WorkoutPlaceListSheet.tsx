import { useState } from "react"
import {
  AccessibilityInfo,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native"
import { useTranslation } from "react-i18next"
import { SafeAreaView } from "react-native-safe-area-context"
import type { LearnedWorkoutPlace } from "@/entities/workout-session"
import { Button } from "@/shared/ui/Button"
import { GlassBackground } from "@/shared/ui/GlassBackground"

interface WorkoutPlaceListSheetProps {
  deletingPlaceId: string | null
  places: LearnedWorkoutPlace[]
  visible: boolean
  onClose: () => void
  onDelete: (place: LearnedWorkoutPlace) => Promise<void>
}

export function WorkoutPlaceListSheet({
  deletingPlaceId,
  places,
  visible,
  onClose,
  onDelete,
}: WorkoutPlaceListSheetProps) {
  const { t } = useTranslation()
  const [deleteFailed, setDeleteFailed] = useState(false)
  const [pendingDeletePlaceId, setPendingDeletePlaceId] = useState<
    string | null
  >(null)

  const confirmDelete = async (place: LearnedWorkoutPlace) => {
    setDeleteFailed(false)
    try {
      await onDelete(place)
      setPendingDeletePlaceId(null)
    } catch {
      setDeleteFailed(true)
      AccessibilityInfo.announceForAccessibility(
        `${t("settings.workoutPlaceReminder.deletePlaceErrorTitle")} ${t(
          "settings.workoutPlaceReminder.deletePlaceErrorBody",
        )}`,
      )
    }
  }

  const closeSheet = () => {
    if (deletingPlaceId !== null) {
      return
    }
    setDeleteFailed(false)
    setPendingDeletePlaceId(null)
    onClose()
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={closeSheet}
    >
      <View className="h-full justify-end bg-yb-result-delete-overlay">
        <Pressable
          accessibilityLabel={t("common.close")}
          accessibilityRole="button"
          className="absolute inset-0"
          disabled={deletingPlaceId !== null}
          onPress={closeSheet}
        />
        <SafeAreaView
          accessibilityViewIsModal
          className="max-h-[85%] overflow-hidden rounded-t-yb-drawer border border-yb-glass-border px-yb-5 pt-yb-3 shadow-yb-lg"
          edges={["bottom"]}
        >
          <GlassBackground cornerRadius={20} />
          <View className="mb-yb-5 h-yb-1 w-yb-12 self-center rounded-full bg-yb-glass-border" />
          <Text className="text-yb-heading-sm text-yb-fg">
            {t("settings.workoutPlaceReminder.listTitle")}
          </Text>
          <Text className="mt-yb-1 text-yb-caption text-yb-fg-secondary">
            {t("settings.workoutPlaceReminder.listBody")}
          </Text>

          <ScrollView
            className="mt-yb-5 shrink"
            contentContainerClassName="gap-yb-3"
            showsVerticalScrollIndicator={false}
          >
            {places.length === 0 ? (
              <View className="overflow-hidden rounded-yb-xl border border-yb-glass-border bg-yb-glass-bg p-yb-4">
                <Text className="text-yb-body text-yb-fg-secondary">
                  {t("settings.workoutPlaceReminder.listEmpty")}
                </Text>
              </View>
            ) : (
              places.map((place, index) => {
                const deleting = deletingPlaceId === place.id
                const confirming = pendingDeletePlaceId === place.id
                return (
                  <View
                    key={place.id}
                    className="overflow-hidden rounded-yb-xl border border-yb-glass-border bg-yb-glass-bg p-yb-4"
                  >
                    <Text className="text-yb-body-lg font-semibold text-yb-fg">
                      {place.label ??
                        t("settings.workoutPlaceReminder.placeFallback", {
                          number: index + 1,
                        })}
                    </Text>
                    {confirming ? (
                      <View
                        className="mt-yb-3 rounded-yb-sm bg-yb-surface-subtle p-yb-4"
                        accessibilityLiveRegion="polite"
                      >
                        <Text className="text-yb-body-sm font-semibold text-yb-status-error">
                          {t("settings.workoutPlaceReminder.deletePlaceTitle")}
                        </Text>
                        <Text className="mt-yb-1 text-yb-caption text-yb-fg-secondary">
                          {t("settings.workoutPlaceReminder.deletePlaceBody")}
                        </Text>
                        {deleteFailed ? (
                          <View
                            className="mt-yb-2"
                            accessibilityLiveRegion="assertive"
                          >
                            <Text className="text-yb-caption font-semibold text-yb-status-error">
                              {t(
                                "settings.workoutPlaceReminder.deletePlaceErrorTitle",
                              )}
                            </Text>
                            <Text className="mt-yb-1 text-yb-caption text-yb-status-error">
                              {t(
                                "settings.workoutPlaceReminder.deletePlaceErrorBody",
                              )}
                            </Text>
                          </View>
                        ) : null}
                        <View className="mt-yb-3 gap-yb-2">
                          <Button
                            variant="danger"
                            label={t("common.delete")}
                            disabled={deletingPlaceId !== null}
                            accessibilityRole="button"
                            accessibilityState={{
                              busy: deleting,
                              disabled: deletingPlaceId !== null,
                            }}
                            onPress={() => {
                              void confirmDelete(place)
                            }}
                          />
                          <Button
                            variant="ghost"
                            label={t("common.cancel")}
                            disabled={deletingPlaceId !== null}
                            accessibilityRole="button"
                            accessibilityState={{
                              disabled: deletingPlaceId !== null,
                            }}
                            onPress={() => {
                              setDeleteFailed(false)
                              setPendingDeletePlaceId(null)
                            }}
                          />
                        </View>
                      </View>
                    ) : (
                      <Button
                        className="mt-yb-3"
                        variant="danger"
                        label={t("common.delete")}
                        disabled={deletingPlaceId !== null}
                        accessibilityRole="button"
                        accessibilityState={{
                          disabled: deletingPlaceId !== null,
                        }}
                        onPress={() => {
                          setDeleteFailed(false)
                          setPendingDeletePlaceId(place.id)
                          AccessibilityInfo.announceForAccessibility(
                            `${t(
                              "settings.workoutPlaceReminder.deletePlaceTitle",
                            )} ${t(
                              "settings.workoutPlaceReminder.deletePlaceBody",
                            )}`,
                          )
                        }}
                      />
                    )}
                  </View>
                )
              })
            )}
          </ScrollView>

          <Button
            className="mb-yb-3 mt-yb-5"
            variant="glass"
            label={t("common.close")}
            disabled={deletingPlaceId !== null}
            accessibilityRole="button"
            accessibilityState={{ disabled: deletingPlaceId !== null }}
            onPress={closeSheet}
          />
        </SafeAreaView>
      </View>
    </Modal>
  )
}
