import { useLocalSearchParams, useRouter } from 'expo-router'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

export default function ResultPage() {
  const router = useRouter()
  const params = useLocalSearchParams()
  
  const tempos = params.tempos ? JSON.parse(params.tempos as string) : []
  const totalExerciseTime = Number(params.totalExerciseTime) || 0
  const totalSets = Number(params.totalSets) || 0

  // 경과시간을 포맷팅하는 함수
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`
    }
    return `${minutes}분 ${secs}초`
  }

  const goToHome = () => {
    router.push('/')
  }

  return (
    <View className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-6 text-center">
        운동 완료!
      </Text>
      
      {/* 총 운동 정보 */}
      <View className="bg-emerald-600 p-4 rounded-xl mb-6">
        <Text className="text-white text-lg font-semibold mb-2 text-center">
          총 운동 정보
        </Text>
        <Text className="text-white text-center mb-1">
          총 운동시간: {formatElapsedTime(totalExerciseTime)}
        </Text>
        <Text className="text-white text-center mb-1">
          총 세트수: {totalSets}세트
        </Text>
        <Text className="text-white text-center">
          운동 종목수: {tempos.length}개
        </Text>
      </View>
      
      <ScrollView className="flex-1">
        <Text className="text-white text-lg mb-4 text-center">
          설정한 운동 목록
        </Text>
        
        {tempos.map((tempo: any, index: number) => (
          <View key={index} className="bg-zinc-800 p-4 rounded-xl mb-4">
            <Text className="text-white text-lg font-semibold mb-2">
              {index + 1}번째 운동
            </Text>
            <Text className="text-white mb-1">
              시작: {tempo.startWith === 'concentric' ? '수축 먼저' : '이완 먼저'}
            </Text>
            <Text className="text-white mb-1">
              수축 시간: {tempo.concentricTime}초
            </Text>
            <Text className="text-white mb-1">
              이완 시간: {tempo.eccentricTime}초
            </Text>
            <Text className="text-white mb-1">
              횟수: {tempo.reps}회
            </Text>
            <Text className="text-white mb-1">
              휴식 시간: {tempo.restTime}초
            </Text>
            <Text className="text-white">
              세트 수: {tempo.setCount}세트
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity
        onPress={goToHome}
        className="bg-emerald-600 py-4 rounded-2xl mt-6"
      >
        <Text className="text-white text-center text-lg font-semibold">
          홈으로 돌아가기
        </Text>
      </TouchableOpacity>
    </View>
  )
} 