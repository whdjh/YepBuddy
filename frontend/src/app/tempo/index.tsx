import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'

export default function Tempo() {
  const router = useRouter()

  const [startWith, setStartWith] = useState<'concentric' | 'eccentric'>('eccentric')
  const [concentricTime, setConcentricTime] = useState('')
  const [eccentricTime, setEccentricTime] = useState('')
  const [reps, setReps] = useState('')

  const isAllFilled =
    concentricTime.trim() !== '' &&
    eccentricTime.trim() !== '' &&
    reps.trim() !== '' &&
    (startWith === 'concentric' || startWith === 'eccentric')

  const onNext = () => {
    if (!isAllFilled) return

    router.push({
      pathname: '/set',
      params: {
        startWith,
        concentricTime,
        eccentricTime,
        reps,
      },
    })
  }

  return (
    <View className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6 text-center">템포 설정</Text>

      {/* 1. 수축/이완 먼저 선택 */}
      <Text className="text-white mb-2">운동 시작 시</Text>
      <View className="flex-row justify-around mb-6">
        <TouchableOpacity
          onPress={() => setStartWith('concentric')}
          className={`py-3 px-6 rounded-2xl ${
            startWith === 'concentric' ? 'bg-emerald-600' : 'bg-zinc-700'
          }`}
        >
          <Text className="text-white font-semibold">수축(단축성수축) 먼저</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setStartWith('eccentric')}
          className={`py-3 px-6 rounded-2xl ${
            startWith === 'eccentric' ? 'bg-emerald-600' : 'bg-zinc-700'
          }`}
        >
          <Text className="text-white font-semibold">이완(신장성수축) 먼저</Text>
        </TouchableOpacity>
      </View>

      {/* 2. 컨트롤 시간 입력 */}
      <View className="mb-4">
        <Text className="text-white mb-2">수축(단축성수축) 시간 (초)</Text>
        <TextInput
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl"
          keyboardType="numeric"
          value={concentricTime}
          onChangeText={setConcentricTime}
          placeholder="예: 2"
          placeholderTextColor="#888"
        />
      </View>

      {/* 3. 이완 시간 입력 */}
      <View className="mb-4">
        <Text className="text-white mb-2">이완(신장성수축) 시간 (초)</Text>
        <TextInput
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl"
          keyboardType="numeric"
          value={eccentricTime}
          onChangeText={setEccentricTime}
          placeholder="예: 4"
          placeholderTextColor="#888"
        />
      </View>

      {/* 4. 운동 횟수 입력 */}
      <View className="mb-8">
        <Text className="text-white mb-2">운동 횟수 (Reps)</Text>
        <TextInput
          className="bg-zinc-800 text-white px-4 py-2 rounded-xl"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
          placeholder="예: 10"
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
        <Text className="text-white text-center text-lg font-semibold">
          다음
        </Text>
      </TouchableOpacity>
    </View>
  )
}
