import "../global.css"
import "@/shared/i18n/i18n"
import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native"
import { Stack } from "expo-router"
import { useColorScheme, View } from "react-native"

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <View className={`flex-1 ${isDark ? "dark" : ""}`}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="workout/record"
            options={{
              headerShown: true,
              headerBackTitle: "홈",
              title: "운동 기록",
              headerTransparent: true,
              headerTintColor: isDark ? "#FFFFFF" : "#3A2A1A",
              headerTitleStyle: { fontWeight: "700" },
            }}
          />
        </Stack>
      </View>
    </ThemeProvider>
  )
}
