import { Platform } from "react-native"
import * as Notifications from "expo-notifications"

interface AndroidNotificationChannelConfig {
  channelId: string
  name: string
  importance?: Notifications.AndroidImportance
}

interface AndroidNotificationChannelDefinition {
  channelId: string
  getName: () => string
  importance?: Notifications.AndroidImportance
}

// Android 알림 채널 설정 적용
async function setAndroidNotificationChannel({
  channelId,
  name,
  importance = Notifications.AndroidImportance.DEFAULT,
}: AndroidNotificationChannelConfig): Promise<void> {
  if (Platform.OS !== "android") {
    return
  }

  await Notifications.setNotificationChannelAsync(channelId, {
    name,
    importance,
  })
}

// Android 알림 채널 등록 함수 생성
export function defineAndroidNotificationChannel({
  channelId,
  getName,
  importance = Notifications.AndroidImportance.DEFAULT,
}: AndroidNotificationChannelDefinition): () => Promise<void> {
  return () =>
    setAndroidNotificationChannel({
      channelId,
      name: getName(),
      importance,
    })
}
