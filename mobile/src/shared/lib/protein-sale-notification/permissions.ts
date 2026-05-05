import * as Notifications from "expo-notifications"
import { Platform } from "react-native"

/** granted 또는 iOS provisional 상태를 프로틴 세일 알림 수신 동의로 */
function isProteinSaleNotificationPermissionGranted(
  permissions: Notifications.NotificationPermissionsStatus,
) {
  return (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}

/** 현재 프로틴 세일 알림 권한만 확인 */
export async function getProteinSaleNotificationPermissionGranted(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    return false
  }

  const existing = await Notifications.getPermissionsAsync()
  return isProteinSaleNotificationPermissionGranted(existing)
}

/** 사용자 ON 액션에서만 iOS 알림 권한을 요청 */
export async function requestProteinSaleNotificationPermissions(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    return false
  }

  if (await getProteinSaleNotificationPermissionGranted()) {
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

  return isProteinSaleNotificationPermissionGranted(requested)
}
