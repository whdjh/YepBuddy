import "../global.css"
import "@/shared/i18n/i18n"
import { useEffect } from "react"
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
import { WorkoutProvider } from "@/entities/workout-session"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  useEffect(() => {
    void Promise.all([
      Notifications.requestPermissionsAsync(),
      Location.requestForegroundPermissionsAsync(),
      initHealthKit(),
    ])
  }, [])

  return (
    <GestureHandlerRootView className="h-full w-full">
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
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
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
