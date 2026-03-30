import { NativeTabs } from "expo-router/unstable-native-tabs"

export const PillNav = Object.assign(NativeTabs, {
  Item: Object.assign(NativeTabs.Trigger, {
    Icon: NativeTabs.Trigger.Icon,
    Label: NativeTabs.Trigger.Label,
  }),
})
