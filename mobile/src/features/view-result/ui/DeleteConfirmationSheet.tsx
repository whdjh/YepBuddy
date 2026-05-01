import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { GlassBackground } from "@/shared/ui/GlassBackground"

interface DeleteConfirmationSheetProps {
  visible: boolean
  isDeleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmationSheet({
  visible,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmationSheetProps) {
  const { t } = useTranslation()
  const overlayColor =
    (useUnstableNativeVariable("--yb-result-delete-overlay") as unknown as string) ||
    "rgba(0,0,0,0.10)"
  const cardBackgroundColor =
    (useUnstableNativeVariable("--yb-result-delete-card-bg") as unknown as string) ||
    "#FFFFFF"
  const cardBorderColor =
    (useUnstableNativeVariable("--yb-result-delete-card-border") as unknown as string) ||
    "rgba(255,255,255,0.80)"
  const buttonBackgroundColor =
    (useUnstableNativeVariable("--yb-result-delete-button-bg") as unknown as string) ||
    "#F2EBDD"
  const buttonBorderColor =
    (useUnstableNativeVariable("--yb-result-delete-button-border") as unknown as string) ||
    "#DDD2BF"
  const buttonTextColor =
    (useUnstableNativeVariable("--yb-result-delete-button-fg") as unknown as string) ||
    "#BD413F"

  if (!visible) {
    return null
  }

  return (
    <View
      className="absolute inset-0 items-center justify-center"
      style={{ backgroundColor: overlayColor, elevation: 20, zIndex: 20 }}
    >
      <Pressable className="absolute inset-0" onPress={onCancel} />
      <View
        className="w-[84%] max-w-[390px] overflow-hidden rounded-yb-xl border px-yb-8 pb-yb-8 pt-yb-8"
        style={{
          backgroundColor: cardBackgroundColor,
          borderColor: cardBorderColor,
          elevation: 21,
          zIndex: 21,
        }}
      >
        <GlassBackground
          cornerRadius={16}
          fallbackClassName="bg-yb-result-delete-card-bg"
        />
        <Text className="mb-yb-2 text-yb-heading-sm font-semibold text-yb-fg">
          {t("workout.result.deleteTitle")}
        </Text>
        <Text className="mb-yb-8 text-yb-body-sm leading-yb-5 text-yb-fg-secondary">
          {t("workout.result.deleteMessage")}
        </Text>
        <Pressable
          disabled={isDeleting}
          className="h-yb-btn-md w-full items-center justify-center overflow-hidden rounded-full border px-yb-6 shadow-sm active:opacity-80"
          onPress={onConfirm}
          style={{
            backgroundColor: buttonBackgroundColor,
            borderColor: buttonBorderColor,
          }}
        >
          <GlassBackground
            cornerRadius={999}
            fallbackClassName="bg-yb-result-delete-button-bg"
          />
          <Text
            className="text-yb-body-lg font-bold"
            style={{ color: buttonTextColor }}
          >
            {t("workout.result.deleteConfirmYes")}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
