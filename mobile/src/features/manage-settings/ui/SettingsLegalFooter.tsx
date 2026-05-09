import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { openWebUrl, privacyPolicyUrl, supportUrl } from "@/shared/lib/legalLinks"

export function SettingsLegalFooter() {
  const { t } = useTranslation()
  const hasLegalLinks = Boolean(privacyPolicyUrl || supportUrl)

  return (
    <View
      accessibilityLabel={t("legal.footerLabel")}
      className="gap-yb-3 pt-yb-2"
    >
      <Text className="text-yb-label font-semibold text-yb-fg-secondary">
        {t("legal.appInfo")}
      </Text>

      {hasLegalLinks && (
        <View className="flex-row flex-wrap items-center gap-yb-2">
          {privacyPolicyUrl && (
            <Pressable
              accessibilityRole="link"
              className="min-h-[36px] justify-center active:opacity-70"
              onPress={() => {
                void openWebUrl(privacyPolicyUrl)
              }}
            >
              <Text className="text-yb-caption font-semibold text-yb-fg-secondary">
                {t("legal.privacyPolicy")}
              </Text>
            </Pressable>
          )}
          {privacyPolicyUrl && supportUrl && (
            <Text className="text-yb-caption text-yb-fg-tertiary">/</Text>
          )}
          {supportUrl && (
            <Pressable
              accessibilityRole="link"
              className="min-h-[36px] justify-center active:opacity-70"
              onPress={() => {
                void openWebUrl(supportUrl)
              }}
            >
              <Text className="text-yb-caption font-semibold text-yb-fg-secondary">
                {t("legal.support")}
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  )
}
