import { NativeTabs } from "expo-router/unstable-native-tabs"
import { WorkoutNavigationGuard } from "@/features/do-workout/ui/WorkoutNavigationGuard"

export default function TabLayout() {
  return (
    <>
      <WorkoutNavigationGuard />
      <NativeTabs tintColor="#D4883A">
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="book.fill" />
          <NativeTabs.Trigger.Label>일지</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tempo">
          <NativeTabs.Trigger.Icon sf="timer" />
          <NativeTabs.Trigger.Label>템포</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="protein">
          <NativeTabs.Trigger.Icon sf="waterbottle.fill" />
          <NativeTabs.Trigger.Label>프로틴</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  )
}
