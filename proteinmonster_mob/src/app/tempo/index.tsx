import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Tempo() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const [startWith, setStartWith] = useState<'concentric' | 'eccentric'>('concentric')
  const [concentricTime, setConcentricTime] = useState('')
  const [eccentricTime, setEccentricTime] = useState('')
  const [reps, setReps] = useState('')
  const [restTime, setRestTime] = useState('')
  const [setCount, setSetCount] = useState('')

  // 기존 운동 데이터가 있으면 가져오기
  const existingTempos = params.tempos ? JSON.parse(params.tempos as string) : []
  const currentExerciseNumber = existingTempos.length + 1

  const isAllFilled =
    concentricTime.trim() !== '' &&
    eccentricTime.trim() !== '' &&
    reps.trim() !== '' &&
    restTime.trim() !== '' &&
    setCount.trim() !== '' &&
    (startWith === 'concentric' || startWith === 'eccentric')

  const onNext = () => {
    if (!isAllFilled) return

    // 현재 설정을 tempo 객체로 만들기
    const currentTempo = {
      startWith,
      concentricTime,
      eccentricTime,
      reps,
      restTime,
      setCount,
    }

    // 기존 운동들과 합치기
    const allTempos = [...existingTempos, currentTempo]

    // 첫 번째 운동인 경우 시작 시간 생성, 아니면 기존 시작 시간 사용
    const exerciseStartTime = currentExerciseNumber === 1 
      ? Date.now().toString() 
      : (params.exerciseStartTime as string) || Date.now().toString()

    router.push({
      pathname: '/exercise',
      params: {
        ...currentTempo,
        tempos: JSON.stringify(allTempos),
        currentExerciseIndex: allTempos.length - 1,
        isFirstExercise: currentExerciseNumber === 1 ? 'true' : 'false',
        exerciseStartTime,
      },
    })
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 px-6 py-10" showsVerticalScrollIndicator={false}>
        {/* 운동 번호 표시 */}
        <Text className="text-white text-lg mb-4 text-center">
          {currentExerciseNumber}번째 운동
        </Text>

        {/* 수축/이완 먼저 선택 */}
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

        {/* 컨트롤 시간 입력 */}
        <View className="mb-4">
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-white text-sm mb-1">수축(단축성수축) 시간(초)</Text>
              <TextInput
                className="bg-zinc-800 text-white px-4 py-2 rounded-xl"
                keyboardType="numeric"
                value={concentricTime}
                onChangeText={setConcentricTime}
                placeholder="예: 3"
                placeholderTextColor="#888"
              />
            </View>
            <View className="flex-1">
              <Text className="text-white text-sm mb-1">이완(신장성수축) 시간(초)</Text>
              <TextInput
                className="bg-zinc-800 text-white px-4 py-2 rounded-xl"
                keyboardType="numeric"
                value={eccentricTime}
                onChangeText={setEccentricTime}
                placeholder="예: 1"
                placeholderTextColor="#888"
              />
            </View>
          </View>
        </View>

        {/* 운동 횟수 & 운동세트수 입력 */}
        <View className="mb-4">
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <Text className="text-white mb-2">운동 횟수 (Reps)</Text>
              <TextInput
                className="bg-zinc-800 text-white px-4 py-2 rounded-xl"
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
                placeholder="최대 20Reps 까지 입력가능"
                placeholderTextColor="#888"
              />
            </View>
            <View className="flex-1">
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
          </View>
        </View>

        {/* 휴식 시간 입력 */}
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

        <TouchableOpacity
          disabled={!isAllFilled}
          onPress={onNext}
          className={`py-3 rounded-2xl ${
            isAllFilled ? 'bg-emerald-600' : 'bg-zinc-600'
          }`}
        >
          <Text className="text-white text-center text-lg font-semibold">
            운동 시작
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
