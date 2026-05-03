import AsyncStorage from "@react-native-async-storage/async-storage"

const ENABLED_KEY = "yb:protein-sale-notification:enabled"
const IDS_KEY = "yb:protein-sale-notification:ids"

// 알림 활성화 상태 조회
export async function getProteinSaleNotificationEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(ENABLED_KEY)) === "true"
}

// 알림 활성화 상태 저장
export async function setProteinSaleNotificationEnabled(
  enabled: boolean,
): Promise<void> {
  await AsyncStorage.setItem(ENABLED_KEY, enabled ? "true" : "false")
}

// 예약 id 목록 조회 및 타입 정규화
export async function getProteinSaleNotificationIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(IDS_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((id): id is string => typeof id === "string")
  } catch {
    return []
  }
}

// 예약 id 목록 저장
export async function saveProteinSaleNotificationIds(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids))
}

// 예약 id 목록 초기화
export async function clearProteinSaleNotificationIds(): Promise<void> {
  await AsyncStorage.removeItem(IDS_KEY)
}
