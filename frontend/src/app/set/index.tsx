import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'

export default function Set() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const [restTime, setRestTime] = useState('')
  const [setCount, setSetCount] = useState('')

  const isAllFilled = restTime.trim() !== '' && setCount.trim() !== ''

  const onNext = () => {
    if (!isAllFilled) return

    const stringParams = Object.fromEntries(
      Object.entries(params || {}).map(([k, v]) => [k, String(v)])
    )

    router.push({
      pathname: '/exercise' as const,
      params: {
        ...stringParams,
        restTime: String(restTime),
        setCount: String(setCount),
      },
    })
  }

  return (
    <View className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6 text-center">세트 설정</Text>

      <View className="mb-4">
        <Text className="text-white mb-2">휴식 시간 (초)</Text>
        <TextInput
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl"
          keyboardType="numeric"
          value={restTime}
          onChangeText={setRestTime}
          placeholder="예: 60"
          placeholderTextColor="#888"
        />
      </View>

      <View className="mb-8">
        <Text className="text-white mb-2">운동 세트 수</Text>
        <TextInput
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl"
          keyboardType="numeric"
          value={setCount}
          onChangeText={setSetCount}
          placeholder="예: 3"
          placeholderTextColor="#888"
        />
      </View>

      <TouchableOpacity
        disabled={!isAllFilled}
        onPress={onNext}
        className={`py-3 rounded-2xl ${
          isAllFilled ? 'bg-emerald-600' : 'bg-zinc-600'
        }`}
      >
        <Text className="text-white text-center text-lg font-semibold">다음</Text>
      </TouchableOpacity>
    </View>
  )
}
