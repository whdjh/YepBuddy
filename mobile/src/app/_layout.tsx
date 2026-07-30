import "../global.css"
import "@/shared/i18n/i18n"
import { useEffect } from "react"
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native"
import { router, Stack } from "expo-router"
import { AppState, useColorScheme, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  ensureProteinSaleNotificationChannel,
  syncProteinSaleNotificationsIfEnabled,
} from "@/entities/protein"
import {
  ensureWorkoutSessionNotificationChannels,
  rebuildAndSyncWorkoutPlaceArrivalReminder,
  registerWorkoutPlaceNotificationHandler,
  syncWorkoutPlaceArrivalReminder,
  syncWorkoutReminderAtNight,
  WorkoutProvider,
} from "@/entities/workout-session"
import { setupProteinSaleNotificationHandler } from "@/features/protein-sale-notification/lib/handler"
import { NotificationPermissionRequestProvider } from "@/shared/lib/notificationPermissionRequest"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  useEffect(() => {
    const unsubscribeProteinSaleNotificationHandler =
      setupProteinSaleNotificationHandler()
    const unsubscribeWorkoutPlaceNotificationHandler =
      registerWorkoutPlaceNotificationHandler(() => router.push("/"))

    void (async () => {
      await Promise.all([
        ensureWorkoutSessionNotificationChannels(),
        ensureProteinSaleNotificationChannel(),
      ])

      await Promise.all([
        rebuildAndSyncWorkoutPlaceArrivalReminder(),
        syncWorkoutReminderAtNight({ allowPrompt: false }),
        syncProteinSaleNotificationsIfEnabled(),
      ])
    })().catch(() => undefined)
    const appStateSubscription = AppState.addEventListener(
      "change",
      (status) => {
        if (status === "active") {
          void syncWorkoutPlaceArrivalReminder().catch(() => false)
        }
      },
    )

    return () => {
      appStateSubscription.remove()
      unsubscribeProteinSaleNotificationHandler()
      unsubscribeWorkoutPlaceNotificationHandler()
    }
  }, [])

  return (
    <GestureHandlerRootView className="h-full w-full">
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <NotificationPermissionRequestProvider
          done={true}
        >
          <WorkoutProvider>
            <View className={`grow ${isDark ? "dark" : ""}`}>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="workout" />
                <Stack.Screen
                  name="calendar"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen name="sessions" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="protein/[id]" />
              </Stack>
            </View>
          </WorkoutProvider>
        </NotificationPermissionRequestProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
