import * as Notifications from "expo-notifications"
import { router } from "expo-router"
import { PROTEIN_SALE_NOTIFICATION_KIND } from "@/entities/protein"

// 동일 알림 중복 처리 방지용 id 캐시
const handledResponseIds = new Set<string>()

// 알림 탭 응답 처리 — 프로틴 세일 알림이면 /protein으로 라우팅
function handleProteinSaleNotificationResponse(
  response: Notifications.NotificationResponse | null | undefined,
) {
  if (!response) {
    return
  }

  const requestId = response.notification.request.identifier
  if (handledResponseIds.has(requestId)) {
    return
  }

  handledResponseIds.add(requestId)

  const data = response.notification.request.content.data
  if (data?.kind === PROTEIN_SALE_NOTIFICATION_KIND) {
    router.push("/protein")
    Notifications.clearLastNotificationResponse()
  }
}

// 알림 응답 리스너 등록 및 콜드스타트 응답 처리, 언마운트 시 구독 해제 함수 반환
export function setupProteinSaleNotificationHandler(): () => void {
  handleProteinSaleNotificationResponse(
    Notifications.getLastNotificationResponse(),
  )

  const sub = Notifications.addNotificationResponseReceivedListener(
    handleProteinSaleNotificationResponse,
  )

  return () => sub.remove()
}
