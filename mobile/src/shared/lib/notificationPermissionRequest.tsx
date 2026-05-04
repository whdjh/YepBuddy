import { createContext, useContext, type PropsWithChildren } from "react"

// 기존 루틴 안내 모달 게이트. OS 권한 요청과 연결X
const NotificationPermissionRequestContext = createContext(false)

interface NotificationPermissionRequestProviderProps extends PropsWithChildren {
  done: boolean
}

// 앱 루트에서 루틴 안내 모달 노출 가능 상태를 하위 화면에 전달
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
