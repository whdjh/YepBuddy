import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

// iOS 알림 권한 확인 및 요청 — Android no-op, Provisional 포함 허용 시 true 반환
export async function requestProteinSaleNotificationPermissions(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    return false
  }

  // 이미 허용(또는 Provisional) 상태면 재요청 없이 통과
  const existing = await Notifications.getPermissionsAsync()
  if (
    existing.granted ||
    existing.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
      allowProvisional: true,
    },
  })

  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}
