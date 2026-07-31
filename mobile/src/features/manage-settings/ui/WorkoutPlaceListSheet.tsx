import { Modal, Pressable, ScrollView, Text, View } from "react-native"
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
  onDelete: (place: LearnedWorkoutPlace) => void
}

function formatCoordinates(place: LearnedWorkoutPlace) {
  return `${place.latitude.toFixed(5)}, ${place.longitude.toFixed(5)}`
}

export function WorkoutPlaceListSheet({
  deletingPlaceId,
  places,
  visible,
  onClose,
  onDelete,
}: WorkoutPlaceListSheetProps) {
  const { i18n, t } = useTranslation()
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="h-full justify-end bg-yb-result-delete-overlay">
        <Pressable
          accessibilityLabel={t("common.close")}
          accessibilityRole="button"
          className="absolute inset-0"
          disabled={deletingPlaceId !== null}
          onPress={onClose}
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
              <View className="rounded-yb-card border border-yb-glass-border bg-yb-glass-bg p-yb-4">
                <Text className="text-yb-body text-yb-fg-secondary">
                  {t("settings.workoutPlaceReminder.listEmpty")}
                </Text>
              </View>
            ) : (
              places.map((place, index) => {
                const deleting = deletingPlaceId === place.id
                return (
                  <View
                    key={place.id}
                    className="rounded-yb-card border border-yb-glass-border bg-yb-glass-bg p-yb-4"
                  >
                    <Text className="text-yb-body-lg font-semibold text-yb-fg">
                      {place.label ||
                        t("settings.workoutPlaceReminder.placeFallback", {
                          number: index + 1,
                        })}
                    </Text>
                    <Text className="mt-yb-1 text-yb-caption text-yb-fg-secondary">
                      {formatCoordinates(place)}
                    </Text>
                    <Text className="mt-yb-2 text-yb-caption text-yb-fg-secondary">
                      {t("settings.workoutPlaceReminder.placeMeta", {
                        count: place.sourceSessionIds.length,
                        date: new Date(place.lastVisitedAt).toLocaleString(
                          i18n.language,
                        ),
                      })}
                    </Text>
                    <Button
                      className="mt-yb-3"
                      variant="ghost"
                      label={t("common.delete")}
                      disabled={deletingPlaceId !== null}
                      accessibilityRole="button"
                      accessibilityState={{
                        busy: deleting,
                        disabled: deletingPlaceId !== null,
                      }}
                      onPress={() => onDelete(place)}
                    />
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
            onPress={onClose}
          />
        </SafeAreaView>
      </View>
    </Modal>
  )
}
