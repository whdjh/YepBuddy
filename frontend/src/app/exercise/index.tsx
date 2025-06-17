import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, ScrollView } from 'react-native'

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

    const runSet = (setIndex: number) => {
      const logsBuffer: string[] = []

      for (let rep = 0; rep < repsCount; rep++) {
        const firstPhase = startWith === 'concentric' ? 'PIK' : 'PIP'
        const secondPhase = startWith === 'concentric' ? 'PIP' : 'PIK'
        const firstTime = startWith === 'concentric' ? concentric : eccentric
        const secondTime = startWith === 'concentric' ? eccentric : concentric

        for (let i = 0; i < firstTime; i++) {
          logsBuffer.push(`${firstPhase} (${rep + 1}회차 - ${i + 1}/${firstTime})`)
        }

        for (let i = 0; i < secondTime; i++) {
          logsBuffer.push(`${secondPhase} (${rep + 1}회차 - ${i + 1}/${secondTime})`)
        }
      }

      logsBuffer.push(`운동 종료 (10초 후 재시작)`)

      let index = 0

      const interval = setInterval(() => {
        setLogs(prev => [...prev, logsBuffer[index]])
        index++

        if (index === logsBuffer.length) {
          clearInterval(interval)

          if (setIndex < sets) {
            // 10초 대기 후 다음 세트
            let restIndex = 1
            const restInterval = setInterval(() => {
              setLogs(prev => [...prev, `휴식 ${restIndex}초 경과`])
              restIndex++
              if (restIndex > rest) {
                clearInterval(restInterval)
                setLogs(prev => [...prev, '운동 시작!'])
                setCurrentSet(prev => prev + 1)
                runSet(setIndex + 1)
              }
            }, 1000)
          } else {
            setLogs(prev => [...prev, '운동이 완전히 종료되었습니다.'])
          }
        }
      }, 1000)
    }

    setLogs([`총 ${sets}세트 시작합니다!`, '운동 시작!'])
    runSet(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ScrollView className="flex-1 bg-black px-6 py-10">
      <Text className="text-white text-2xl font-bold mb-4 text-center">
        운동 진행
      </Text>
      {logs.map((log, index) => (
        <Text key={index} className="text-white mb-2">
          {log}
        </Text>
      ))}
    </ScrollView>
  )
}
