import * as Location from "expo-location"
import * as Notifications from "expo-notifications"
import { Alert, Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import { ensureWorkoutPlaceArrivalNotificationChannel } from "./notificationChannels"

/** 위치 권한 응답이 허용 상태인지 확인 */
function isLocationPermissionGranted(
  permission: Location.LocationPermissionResponse,
) {
  return permission.status === Location.PermissionStatus.GRANTED
}

/** 플랫폼별 알림 권한 응답이 알림 표시 가능 상태인지 확인 */
function isNotificationPermissionGranted(
  permission: Notifications.NotificationPermissionsStatus,
) {
  return (
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}

/** Android 백그라운드 위치 권한 화면으로 이동하기 전 사용자 동의 확인 */
async function confirmAndroidBackgroundLocationRequest() {
  if (Platform.OS !== "android") {
    return true
  }

  return new Promise<boolean>((resolve) => {
    let settled = false
    const settle = (value: boolean) => {
      if (!settled) {
        settled = true
        resolve(value)
      }
    }

    Alert.alert(
      i18n.t("settings.workoutPlaceReminder.backgroundPermissionTitle"),
      i18n.t("settings.workoutPlaceReminder.backgroundPermissionBody"),
      [
        {
          text: i18n.t("common.cancel"),
          style: "cancel",
          onPress: () => settle(false),
        },
        {
          text: i18n.t(
            "settings.workoutPlaceReminder.backgroundPermissionAction",
          ),
          onPress: () => settle(true),
        },
      ],
      { cancelable: true, onDismiss: () => settle(false) },
    )
  })
}

/** 알림과 foreground·background 위치 권한을 확인하고 필요할 때만 요청 */
export async function getWorkoutPlaceArrivalPermissions({
  allowPrompt,
}: {
  allowPrompt: boolean
}) {
  let notificationGranted = isNotificationPermissionGranted(
    await Notifications.getPermissionsAsync(),
  )
  if (!notificationGranted && allowPrompt) {
    await ensureWorkoutPlaceArrivalNotificationChannel()
    notificationGranted = isNotificationPermissionGranted(
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: false,
          allowSound: true,
          allowProvisional: true,
        },
      }),
    )
  }

  let foregroundGranted = isLocationPermissionGranted(
    await Location.getForegroundPermissionsAsync(),
  )
  if (!foregroundGranted && allowPrompt) {
    foregroundGranted = isLocationPermissionGranted(
      await Location.requestForegroundPermissionsAsync(),
    )
  }

  let backgroundGranted = isLocationPermissionGranted(
    await Location.getBackgroundPermissionsAsync(),
  )
  if (!backgroundGranted && allowPrompt && foregroundGranted) {
    if (await confirmAndroidBackgroundLocationRequest()) {
      backgroundGranted = isLocationPermissionGranted(
        await Location.requestBackgroundPermissionsAsync(),
      )
    }
  }

  return notificationGranted && foregroundGranted && backgroundGranted
}
