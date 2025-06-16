import { Text, View, Button } from "react-native";
import { useRouter } from 'expo-router';
 
export default function Index() {
  const router = useRouter();

  return (
    <View className="justify-center items-center">
      <Text className="text-4xl font-bold">메인페이지</Text>
      <Button title="이동버튼" onPress={() => router.push('/tempo')} />
    </View>
  );
}