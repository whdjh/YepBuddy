import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { GlassTextarea } from "@/shared/ui/Input"

interface MemoSectionProps {
  value: string
  onChangeText: (text: string) => void
}

export function MemoSection({ value, onChangeText }: MemoSectionProps) {
  const { t } = useTranslation()

  return (
    <View className="px-yb-5 mt-yb-8">
      <Text className="text-yb-fg font-bold text-yb-body-lg mb-yb-3">
        {t("workout.active.memo")}
      </Text>
      <GlassTextarea
        placeholder={t("workout.active.memoPlaceholder")}
        defaultValue={value}
        onChangeText={onChangeText}
      />
    </View>
  )
}
