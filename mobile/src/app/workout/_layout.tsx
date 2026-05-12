import { Stack } from "expo-router"
import { WorkoutNavigationGuard } from "@/features/do-workout/ui/WorkoutNavigationGuard"

export default function WorkoutLayout() {
  return (
    <>
      <WorkoutNavigationGuard />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="countdown"
          options={{
            gestureEnabled: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="active"
          options={{
            gestureEnabled: false,
            animation: "fade",
          }}
        />
        <Stack.Screen name="[id]" />
      </Stack>
    </>
  )
}
