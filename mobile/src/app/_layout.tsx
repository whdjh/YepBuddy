import "../global.css"
import "@/shared/i18n/i18n"
import { useEffect, useState } from "react"
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native"
import { Stack } from "expo-router"
import { useColorScheme, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as Notifications from "expo-notifications"
import * as Location from "expo-location"
import { initHealthKit } from "@/entities/workout-session/api/healthKit"
import {
  syncWorkoutReminderAtNight,
  WorkoutProvider,
} from "@/entities/workout-session"
import { NotificationPermissionRequestProvider } from "@/shared/lib/notificationPermissionRequest"
import {
  setupProteinSaleNotificationHandler,
  syncProteinSaleNotificationsIfEnabled,
} from "@/shared/lib/protein-sale-notification"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const [
    notificationPermissionRequestDone,
    setNotificationPermissionRequestDone,
  ] = useState(false)

  useEffect(() => {
    let isMounted = true

    // 최초 진입 시 OS 알림 권한을 먼저 요청
    // 허용/거절 여부와 관계없이 요청 플로우가 끝나면 앱 자체 루틴 안내 모달 오픈
    void Notifications.requestPermissionsAsync()
      .catch(() => undefined)
      .finally(() => {
        if (isMounted) {
          setNotificationPermissionRequestDone(true)
        }
      })

    const unsubscribeProteinSaleNotificationHandler =
      setupProteinSaleNotificationHandler()

    void syncProteinSaleNotificationsIfEnabled().catch(() => undefined)
    void syncWorkoutReminderAtNight().catch(() => undefined)

    // 위치 권한과 HealthKit 초기화는 루틴 안내 모달 노출막음X
    void Promise.all([
      Location.requestForegroundPermissionsAsync(),
      initHealthKit(),
    ]).catch(() => undefined)

    return () => {
      isMounted = false
      unsubscribeProteinSaleNotificationHandler()
    }
  }, [])

  return (
    <GestureHandlerRootView className="h-full w-full">
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <NotificationPermissionRequestProvider
          done={notificationPermissionRequestDone}
        >
          <WorkoutProvider>
            <View className={`grow ${isDark ? "dark" : ""}`}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="workout/countdown"
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: "fade",
                  }}
                />
                <Stack.Screen
                  name="workout/active"
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                    animation: "fade",
                  }}
                />
                <Stack.Screen
                  name="workout/[id]"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            </View>
          </WorkoutProvider>
        </NotificationPermissionRequestProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
