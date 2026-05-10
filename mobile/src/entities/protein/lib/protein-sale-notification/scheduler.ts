import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import i18n from "@/shared/i18n/i18n"
import {
  ensureProteinSaleNotificationChannel,
  PROTEIN_SALE_NOTIFICATION_CHANNEL_ID,
} from "./channels"
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

let proteinSaleNotificationTask: Promise<unknown> = Promise.resolve()

// 여러 알림 작업이 동시에 들어와도 앞 작업이 끝난 뒤 다음 작업을 실행
function runProteinSaleNotificationTask<T>(task: () => Promise<T>): Promise<T> {
  const nextTask = proteinSaleNotificationTask.then(task, task)
  proteinSaleNotificationTask = nextTask.catch(() => undefined)
  return nextTask
}

async function cancelNotificationIds(ids: string[]): Promise<string[]> {
  const failedIds: string[] = []

  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id)
    } catch {
      failedIds.push(id)
    }
  }

  return failedIds
}

async function cancelProteinSaleNotificationsNow(): Promise<void> {
  const ids = await getProteinSaleNotificationIds()
  const failedIds = await cancelNotificationIds(ids)

  if (failedIds.length > 0) {
    await saveProteinSaleNotificationIds(failedIds)
    return
  }

  await clearProteinSaleNotificationIds()
}

// 저장된 예약 id 전체 취소 및 목록 초기화
export function cancelProteinSaleNotifications(): Promise<void> {
  return runProteinSaleNotificationTask(cancelProteinSaleNotificationsNow)
}

function getProteinSaleNotificationTrigger(date: Date) {
  const trigger: Notifications.DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
  }

  if (Platform.OS !== "android") {
    return trigger
  }

  return {
    ...trigger,
    channelId: PROTEIN_SALE_NOTIFICATION_CHANNEL_ID,
  }
}

/** 권한 모드에 따라 향후 세일 알림 전체를 재예약 */
async function scheduleProteinSaleNotificationsNow({
  allowPrompt = true,
}: ScheduleProteinSaleNotificationsOptions = {}): Promise<boolean> {
  const scheduledIds: string[] = []

  try {
    const granted = allowPrompt
      ? await requestProteinSaleNotificationPermissions()
      : await getProteinSaleNotificationPermissionGranted()
    if (!granted) {
      await setProteinSaleNotificationEnabled(false)
      await cancelProteinSaleNotificationsNow()
      return false
    }

    await ensureProteinSaleNotificationChannel()
    await cancelProteinSaleNotificationsNow()

    const plans = buildProteinSaleNotificationPlans()

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
        trigger: getProteinSaleNotificationTrigger(plan.notificationDate),
      })

      scheduledIds.push(id)
    }

    await saveProteinSaleNotificationIds(scheduledIds)
    await setProteinSaleNotificationEnabled(true)
    return true
  } catch {
    if (scheduledIds.length === 0) {
      await setProteinSaleNotificationEnabled(false).catch(() => undefined)
      await cancelProteinSaleNotificationsNow().catch(() => undefined)
      return false
    }

    const failedIds = await cancelNotificationIds(scheduledIds).catch(
      () => scheduledIds,
    )

    await setProteinSaleNotificationEnabled(false).catch(() => undefined)
    if (failedIds.length > 0) {
      await saveProteinSaleNotificationIds(failedIds).catch(() => undefined)
    } else {
      await clearProteinSaleNotificationIds().catch(() => undefined)
    }
    return false
  }
}

export function scheduleProteinSaleNotifications(
  options: ScheduleProteinSaleNotificationsOptions = {},
): Promise<boolean> {
  return runProteinSaleNotificationTask(() =>
    scheduleProteinSaleNotificationsNow(options),
  )
}

// 알림 비활성화 및 예약 전체 취소
async function disableProteinSaleNotificationsNow(): Promise<void> {
  await setProteinSaleNotificationEnabled(false)
  await cancelProteinSaleNotificationsNow()
}

export function disableProteinSaleNotifications(): Promise<void> {
  return runProteinSaleNotificationTask(disableProteinSaleNotificationsNow)
}

// 앱 시작 시 활성화 상태 확인 후 예약 동기화
export function syncProteinSaleNotificationsIfEnabled(): Promise<void> {
  return runProteinSaleNotificationTask(async () => {
    if (!(await getProteinSaleNotificationEnabled())) {
      return
    }

    await scheduleProteinSaleNotificationsNow({ allowPrompt: false }).catch(
      () => undefined,
    )
  })
}
