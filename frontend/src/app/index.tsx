import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'

export default function HomeScreen() {
  const router = useRouter()

  const goToTempo = () => {
    router.push('/tempo')
  }

  return (
    <View className="flex-1 justify-center items-center bg-black px-6">
      <Text className="text-3xl font-bold mb-6 text-center text-white">
        환영합니다!
      </Text>
      <TouchableOpacity
        onPress={goToTempo}
        className="bg-zinc-700 px-6 py-3 rounded-2xl"
      >
        <Text className="text-white text-lg font-semibold">시작하기</Text>
      </TouchableOpacity>
    </View>
  )
}
