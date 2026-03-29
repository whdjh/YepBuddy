import "../global.css"
import "@/shared/i18n/i18n"
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native"
import { Stack } from "expo-router"
import { useColorScheme, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  return (
    <GestureHandlerRootView className="flex-1">
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View className={`flex-1 ${isDark ? "dark" : ""}`}>
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
        </Stack>
      </View>
    </ThemeProvider>
    </GestureHandlerRootView>
  )
}
