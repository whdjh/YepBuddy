import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import { buildProteinSaleNotificationPlans } from "./events"
import {
  getProteinSaleNotificationPermissionGranted,
  requestProteinSaleNotificationPermissions,
} from "./permissions"
import {
  clearProteinSaleNotificationIds,
  getProteinSaleNotificationEnabled,
  getProteinSaleNotificationIds,
  saveProteinSaleNotificationIds,
  setProteinSaleNotificationEnabled,
} from "./storage"

export const PROTEIN_SALE_NOTIFICATION_KIND = "myproteinSale"

type ScheduleProteinSaleNotificationsOptions = {
  allowPrompt?: boolean
}

// 저장된 예약 id 전체 취소 및 목록 초기화
export async function cancelProteinSaleNotifications(): Promise<void> {
  const ids = await getProteinSaleNotificationIds()

  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined),
    ),
  )

  await clearProteinSaleNotificationIds()
}

/** 권한 모드에 따라 향후 세일 알림 전체를 재예약 */
export async function scheduleProteinSaleNotifications({
  allowPrompt = true,
}: ScheduleProteinSaleNotificationsOptions = {}): Promise<boolean> {
  if (Platform.OS !== "ios") {
    return false
  }

  try {
    const granted = allowPrompt
      ? await requestProteinSaleNotificationPermissions()
      : await getProteinSaleNotificationPermissionGranted()
    if (!granted) {
      await setProteinSaleNotificationEnabled(false)
      await cancelProteinSaleNotifications()
      return false
    }

    await cancelProteinSaleNotifications()

    const plans = buildProteinSaleNotificationPlans()
    const ids: string[] = []

    for (const plan of plans) {
      const eventName = i18n.t(plan.titleKey)
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t("protein.saleNotifications.notificationTitle"),
          subtitle: i18n.t("protein.saleNotifications.notificationSubtitle", {
            eventName,
          }),
          body: i18n.t("protein.saleNotifications.notificationBody", {
            eventName,
          }),
          data: {
            kind: PROTEIN_SALE_NOTIFICATION_KIND,
            eventId: plan.eventId,
            year: plan.year,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: plan.notificationDate,
        },
      })

      ids.push(id)
    }

    await saveProteinSaleNotificationIds(ids)
    await setProteinSaleNotificationEnabled(true)
    return true
  } catch {
    await setProteinSaleNotificationEnabled(false).catch(() => undefined)
    await cancelProteinSaleNotifications().catch(() => undefined)
    return false
  }
}

// 알림 비활성화 및 예약 전체 취소
export async function disableProteinSaleNotifications(): Promise<void> {
  await setProteinSaleNotificationEnabled(false)
  await cancelProteinSaleNotifications()
}

// 앱 시작 시 활성화 상태 확인 후 예약 동기화
export async function syncProteinSaleNotificationsIfEnabled(): Promise<void> {
  if (!(await getProteinSaleNotificationEnabled())) {
    return
  }

  await scheduleProteinSaleNotifications({ allowPrompt: false }).catch(
    () => undefined,
  )
}
