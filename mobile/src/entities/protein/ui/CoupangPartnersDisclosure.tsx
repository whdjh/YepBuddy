import { Text, View } from "react-native"

const DISCLOSURE_TEXT = "이 포스팅은 쿠팡파트너스 활동의 일환으로\n 이에 따른 일정액의 수수료를 제공받습니다"

export function CoupangPartnersDisclosure() {
  return (
    <View className="mb-yb-3 rounded-yb-lg border border-yb-border bg-yb-fill-pale px-yb-5 py-yb-4">
      <Text className="text-center text-yb-fg-secondary text-yb-caption font-medium leading-5">
        {DISCLOSURE_TEXT}
      </Text>
    </View>
  )
}
