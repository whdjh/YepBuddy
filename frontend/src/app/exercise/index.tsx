import { useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

export default function ExercisePage() {
  const {
    startWith,
    concentricTime,
    eccentricTime,
    reps,
    restTime,
    setCount,
  } = useLocalSearchParams<{
    startWith: 'concentric' | 'eccentric'
    concentricTime: string
    eccentricTime: string
    reps: string
    restTime: string
    setCount: string
  }>()

  const [logs, setLogs] = useState<string[]>([])
  const [currentSet, setCurrentSet] = useState(1)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const logsRef = useRef<string[]>([])
  const exerciseStartTimeRef = useRef<number>(0)

  // 로그 추가 함수
  const addLog = (message: string) => {
    logsRef.current = [...logsRef.current, message]
    setLogs([...logsRef.current])
  }

  // 경과시간을 포맷팅하는 함수
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 경과시간 업데이트
  useEffect(() => {
    if (!startTime) return

    const timer = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  useEffect(() => {
    const concentric = Number(concentricTime)
    const eccentric = Number(eccentricTime)
    const repsCount = Number(reps)
    const rest = Number(restTime)
    const sets = Number(setCount)

    if (
      !startWith ||
      isNaN(concentric) ||
      isNaN(eccentric) ||
      isNaN(repsCount) ||
      isNaN(rest) ||
      isNaN(sets)
    )
      return

    // 운동 시작 시간 설정
    setStartTime(new Date())
    exerciseStartTimeRef.current = Date.now()

    const runSet = (setIndex: number) => {
      // TODO: 각 세트 시작 전에 세트 번호 표시 -> 소리로 변경 예정
      addLog(`${setIndex}세트 시작`)

      const firstPhase = startWith === 'concentric' ? 'PIK' : 'PIP'
      const secondPhase = startWith === 'concentric' ? 'PIP' : 'PIK'
      const firstTime = startWith === 'concentric' ? concentric : eccentric
      const secondTime = startWith === 'concentric' ? eccentric : concentric

      let rep = 0
      let phase = 0 // 0: first phase, 1: second phase
      let time = 0
      let currentStep = 0

      const totalSteps = repsCount * (firstTime + secondTime)
      
      const interval = setInterval(() => {
        const now = Date.now()
        const expectedTime = exerciseStartTimeRef.current + (currentStep * 1000)
        
        // 시간 오차가 100ms 이상이면 조정
        if (Math.abs(now - expectedTime) > 100) {
          exerciseStartTimeRef.current = now - (currentStep * 1000)
        }

        if (rep >= repsCount) {
          // 모든 반복 완료
          clearInterval(interval)
          
          if (setIndex < sets) {
            // 사용자 설정 휴식시간 대기 후 다음 세트
            addLog('휴식시작')
            let restElapsed = 0
            const restStartTime = Date.now()
            const restInterval = setInterval(() => {
              const restNow = Date.now()
              const expectedRestTime = restStartTime + (restElapsed * 1000)
              
              if (Math.abs(restNow - expectedRestTime) > 100) {
                restElapsed = Math.floor((restNow - restStartTime) / 1000)
              } else {
                restElapsed++
              }
              
              if (restElapsed < rest) {
                addLog(`${restElapsed}초`)
              }
              if (restElapsed >= rest) {
                clearInterval(restInterval)
                addLog('휴식종료')
                setCurrentSet(prev => prev + 1)
                exerciseStartTimeRef.current = Date.now()
                runSet(setIndex + 1)
              }
            }, 1000)
          } else {
            addLog('운동이 완전히 종료되었습니다.')
          }
          return
        }

        if (phase === 0) {
          // 첫 번째 페이즈 (PIK 또는 PIP)
          addLog(`${firstPhase} (${rep + 1}회차 - ${time + 1}/${firstTime})`)
          time++
          currentStep++
          
          if (time >= firstTime) {
            phase = 1
            time = 0
          }
        } else {
          // 두 번째 페이즈 (PIP 또는 PIK)
          addLog(`${secondPhase} (${rep + 1}회차 - ${time + 1}/${secondTime})`)
          time++
          currentStep++
          
          if (time >= secondTime) {
            phase = 0
            time = 0
            rep++
          }
        }
      }, 1000)
    }

    logsRef.current = []
    setLogs([])
    runSet(1)
    
  }, [])

  return (
    <View className="flex-1 bg-black">
      {/* 플로팅 경과시간 */}
      <View className="absolute top-12 left-0 right-0 z-10 bg-black/80 py-2 px-4">
        <Text className="text-white text-center text-lg font-semibold">
          총 경과시간: {formatElapsedTime(elapsedTime)}
          현재 세트수: {currentSet}
        </Text>
      </View>
      
      <ScrollView className="flex-1 px-6 pt-20 pb-10">
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          운동 진행
        </Text>
        {logs.map((log, index) => (
          <Text key={index} className="text-white mb-2">
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  )
}
