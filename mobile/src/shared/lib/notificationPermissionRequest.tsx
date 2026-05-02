import { createContext, useContext, type PropsWithChildren } from "react"

// OS 알림 권한 요청 팝업이 끝난 뒤 앱 자체 루틴 안내 모달을 띄우기 위한 게이트
// 권한 허용 여부가 아니라 요청 플로우가 완료됐는지만
const NotificationPermissionRequestContext = createContext(false)

interface NotificationPermissionRequestProviderProps extends PropsWithChildren {
  done: boolean
}

// 앱 루트에서 알림 권한 요청 완료 상태를 하위 화면에 전달
export function NotificationPermissionRequestProvider({
  done,
  children,
}: NotificationPermissionRequestProviderProps) {
  return (
    <NotificationPermissionRequestContext.Provider value={done}>
      {children}
    </NotificationPermissionRequestContext.Provider>
  )
}

// 루틴 안내 모달을 띄워도 되는 시점인지 하위 화면에서 확인
export function useNotificationPermissionRequestDone() {
  return useContext(NotificationPermissionRequestContext)
}
