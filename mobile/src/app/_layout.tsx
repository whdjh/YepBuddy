import "../global.css"
import "@/shared/i18n/i18n"
import { useEffect } from "react"
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native"
import { router, Stack } from "expo-router"
import { useColorScheme, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import {
  ensureWorkoutSessionNotificationChannels,
  registerWorkoutPlaceArrivalNotificationHandler,
  syncWorkoutPlaceArrivalReminder,
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

  useEffect(() => {
    const unsubscribeProteinSaleNotificationHandler =
      setupProteinSaleNotificationHandler()
    const unsubscribeWorkoutPlaceArrivalNotificationHandler =
      registerWorkoutPlaceArrivalNotificationHandler(() => router.push("/"))

    void (async () => {
      await ensureWorkoutSessionNotificationChannels()

      await Promise.all([
        syncWorkoutPlaceArrivalReminder({ allowPrompt: false }),
        syncWorkoutReminderAtNight({ allowPrompt: false }),
      ])
    })().catch(() => undefined)
    void syncProteinSaleNotificationsIfEnabled().catch(() => undefined)

    return () => {
      unsubscribeProteinSaleNotificationHandler()
      unsubscribeWorkoutPlaceArrivalNotificationHandler()
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
