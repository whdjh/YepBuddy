import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"

export function CoupangPartnersDisclosure() {
  const { t } = useTranslation()

  return (
    <View className="mb-yb-3 rounded-yb-lg border border-yb-border bg-yb-fill-pale px-yb-5 py-yb-4">
      <Text className="text-center text-yb-fg-secondary text-yb-caption font-medium leading-5">
        {t("protein.disclosure.coupangPartners")}
      </Text>
    </View>
  )
}
