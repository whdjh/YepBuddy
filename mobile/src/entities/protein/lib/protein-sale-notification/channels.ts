import * as Notifications from "expo-notifications"
import i18n from "@/shared/i18n/i18n"
import { defineAndroidNotificationChannel } from "@/shared/lib/androidNotificationChannel"

export const PROTEIN_SALE_NOTIFICATION_CHANNEL_ID = "protein-sale"

// 단백질 할인 알림 채널 등록
export const ensureProteinSaleNotificationChannel =
  defineAndroidNotificationChannel({
    channelId: PROTEIN_SALE_NOTIFICATION_CHANNEL_ID,
    getName: () => i18n.t("protein.saleNotifications.toggleTitle"),
    importance: Notifications.AndroidImportance.DEFAULT,
  })
