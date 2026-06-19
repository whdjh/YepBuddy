import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { GlassTextarea } from "@/shared/ui/GlassTextarea"
import { IconButton } from "@/shared/ui/IconButton"
import { SymbolView } from "@/shared/ui/SymbolView"

interface MemoSectionProps {
  value: string
  placeholder?: string | null
  onChangeText: (text: string) => void
}

export function MemoSection({
  value,
  placeholder,
  onChangeText,
}: MemoSectionProps) {
  const { t } = useTranslation()
  const { accent } = useCardColors()
  const previousMemo = placeholder?.trim()
  const canUsePreviousMemo =
    previousMemo !== undefined &&
    previousMemo.length > 0 &&
    value.trim().length === 0

  return (
    <View className="px-yb-6 mt-yb-8">
      <View className="mb-yb-4 flex-row items-center justify-between">
        <Text className="text-yb-fg font-bold text-yb-body-lg">
          {t("workout.active.memo")}
        </Text>
        {canUsePreviousMemo && (
          <IconButton
            variant="edit"
            accessibilityLabel={t("workout.active.usePreviousMemo")}
            onPress={() => onChangeText(previousMemo)}
          >
            <SymbolView name="doc.on.doc" size={17} tintColor={accent} />
          </IconButton>
        )}
      </View>
      <GlassTextarea
        placeholder={placeholder ?? t("workout.active.memoPlaceholder")}
        value={value}
        onChangeText={onChangeText}
      />
      {canUsePreviousMemo && (
        <Text className="text-yb-fg-tertiary mt-yb-2 text-yb-caption">
          {t("workout.active.previousMemoHint")}
        </Text>
      )}
    </View>
  )
}
