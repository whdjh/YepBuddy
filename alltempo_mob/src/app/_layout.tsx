import { Stack } from "expo-router";
import { View } from 'react-native'
import "@/src/styles/global.css";

export default function RootLayout() {
  return (
    <View className="flex-1 dark bg-black">
      <Stack />
    </View>
  );
}
