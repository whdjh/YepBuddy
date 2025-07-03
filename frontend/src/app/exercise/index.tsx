import { Audio } from 'expo-av'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'

// 한국어 숫자 매핑
const koreanNumbers: { [key: number]: string } = {
  1: '하나',
  2: '둘',
  3: '셋',
  4: '넷',
  5: '다섯',
  6: '여섯',
  7: '일곱',
  8: '여덟',
  9: '아홉',
  10: '열',
  11: '열하나',
  12: '열둘',
  13: '열셋',
  14: '열넷',
  15: '열다섯',
  16: '열여섯',
  17: '열일곱',
  18: '열여덟',
  19: '열아홉',
  20: '스물'
}

// 영어 숫자 매핑 (파일명용)
const englishNumbers: { [key: number]: string } = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
  20: 'twenty',
}

// 숫자 mp3 파일 미리 require
const countSounds: { [key: number]: any } = {
  1: require('../../assets/sounds/koreacount/one.mp3'),
  2: require('../../assets/sounds/koreacount/two.mp3'),
  3: require('../../assets/sounds/koreacount/three.mp3'),
  4: require('../../assets/sounds/koreacount/four.mp3'),
  5: require('../../assets/sounds/koreacount/five.mp3'),
  6: require('../../assets/sounds/koreacount/six.mp3'),
  7: require('../../assets/sounds/koreacount/seven.mp3'),
  8: require('../../assets/sounds/koreacount/eight.mp3'),
  9: require('../../assets/sounds/koreacount/nine.mp3'),
  10: require('../../assets/sounds/koreacount/ten.mp3'),
  11: require('../../assets/sounds/koreacount/eleven.mp3'),
  12: require('../../assets/sounds/koreacount/twelve.mp3'),
  13: require('../../assets/sounds/koreacount/thirteen.mp3'),
  14: require('../../assets/sounds/koreacount/fourteen.mp3'),
  15: require('../../assets/sounds/koreacount/fifteen.mp3'),
  16: require('../../assets/sounds/koreacount/sixteen.mp3'),
  17: require('../../assets/sounds/koreacount/seventeen.mp3'),
  18: require('../../assets/sounds/koreacount/eighteen.mp3'),
  19: require('../../assets/sounds/koreacount/nineteen.mp3'),
  20: require('../../assets/sounds/koreacount/twenty.mp3'),
}

// 휴식 소리 파일
const restSounds = {
  start: require('../../assets/sounds/rest/start.mp3'),
  end: require('../../assets/sounds/rest/end.mp3'),
}

export default function ExercisePage() {
  const {
    startWith,
    concentricTime,
    eccentricTime,
    reps,
    restTime,
    setCount,
    tempos,
    currentExerciseIndex,
    isFirstExercise,
    exerciseStartTime,
  } = useLocalSearchParams<{
    startWith: 'concentric' | 'eccentric'
    concentricTime: string
    eccentricTime: string
    reps: string
    restTime: string
    setCount: string
    tempos: string
    currentExerciseIndex: string
    isFirstExercise: string
    exerciseStartTime: string
  }>()

  const [logs, setLogs] = useState<string[]>([])
  const [currentSet, setCurrentSet] = useState(1)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showExerciseComplete, setShowExerciseComplete] = useState(false)
  const logsRef = useRef<string[]>([])
  const exerciseStartTimeRef = useRef<number>(0)
  const pikSoundRef = useRef<Audio.Sound | null>(null)
  const pipSoundRef = useRef<Audio.Sound | null>(null)
  const router = useRouter()

  // 소리 초기화
  useEffect(() => {
    const loadSounds = async () => {
      try {
        // PIK 소리
        const { sound: pikSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep/pik.mp3')
        )
        pikSoundRef.current = pikSound

        // PIP 소리
        const { sound: pipSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep/pip.mp3')
        )
        pipSoundRef.current = pipSound
      } catch (error) {
        console.log('소리 로드 실패:', error)
      }
    }

    loadSounds()

    // 컴포넌트 언마운트 시 소리 정리
    return () => {
      if (pikSoundRef.current) {
        pikSoundRef.current.unloadAsync()
      }
      if (pipSoundRef.current) {
        pipSoundRef.current.unloadAsync()
      }
    }
  }, [])

  // 소리 재생 함수
  const playSound = async (type: 'pik' | 'pip') => {
    try {
      const sound = type === 'pik' ? pikSoundRef.current : pipSoundRef.current
      if (sound) {
        await sound.replayAsync()
      }
    } catch (error) {
      console.log('소리 재생 실패:', error)
    }
  }

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

  // 실시간 경과시간 계산
  const getCurrentElapsedTime = () => {
    if (!startTime) return 0
    const now = new Date()
    return Math.floor((now.getTime() - startTime.getTime()) / 1000)
  }

  // 경과시간 업데이트
  useEffect(() => {
    if (!startTime) return

    const timer = setInterval(() => {
      setElapsedTime(getCurrentElapsedTime())
    }, 100)

    return () => clearInterval(timer)
  }, [startTime])

  // 숫자 카운트 소리 재생 함수
  const playCountSound = async (num: number) => {
    const soundFile = countSounds[num]
    if (!soundFile) return
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile)
      await sound.replayAsync()
      setTimeout(() => {
        sound.unloadAsync()
      }, 1500)
    } catch (e) {
      console.log('카운트 소리 재생 실패:', e)
    }
  }

  // 휴식 소리 재생 함수
  const playRestSound = async (type: 'start' | 'end') => {
    try {
      const soundFile = restSounds[type]
      const { sound } = await Audio.Sound.createAsync(soundFile)
      await sound.replayAsync()
      setTimeout(() => {
        sound.unloadAsync()
      }, 2000)
    } catch (e) {
      console.log('휴식 소리 재생 실패:', e)
    }
  }

  useEffect(() => {
    const concentric = Number(concentricTime)
    const eccentric = Number(eccentricTime)
    const repsCount = Number(reps)
    const rest = Number(restTime)
    const sets = Number(setCount)
    const exerciseIndex = Number(currentExerciseIndex)

    if (
      !startWith ||
      isNaN(concentric) ||
      isNaN(eccentric) ||
      isNaN(repsCount) ||
      isNaN(rest) ||
      isNaN(sets)
    )
      return

    // 시작 시간 설정 (전달받은 시간 사용)
    const startTimeValue = exerciseStartTime ? new Date(Number(exerciseStartTime)) : new Date()
    setStartTime(startTimeValue)
    exerciseStartTimeRef.current = Number(exerciseStartTime) || Date.now()

    const runSet = (setIndex: number) => {
      addLog(`${setIndex}세트 시작`)

      const firstPhase = startWith === 'concentric' ? 'PIK' : 'PIP'
      const secondPhase = startWith === 'concentric' ? 'PIP' : 'PIK'
      const firstTime = startWith === 'concentric' ? concentric : eccentric
      const secondTime = startWith === 'concentric' ? eccentric : concentric

      let rep = 0
      let phase = 0 // 0: first phase, 1: second phase
      let time = 0
      let currentStep = 0
      let interval: number | null = null

      const startInterval = () => {
        interval = setInterval(() => {
          const now = Date.now()
          const expectedTime = exerciseStartTimeRef.current + (currentStep * 1000)

          if (Math.abs(now - expectedTime) > 100) {
            exerciseStartTimeRef.current = now - (currentStep * 1000)
          }

          if (rep >= repsCount) {
            clearInterval(interval!)
            if (setIndex < sets) {
              addLog('휴식시작')
              playRestSound('start')
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
                  playRestSound('end')
                  setCurrentSet(prev => prev + 1)
                  exerciseStartTimeRef.current = Date.now()
                  runSet(setIndex + 1)
                }
              }, 1000)
            } else {
              addLog('운동이 완전히 종료되었습니다.')
              handleExerciseComplete()
            }
            return
          }

          if (phase === 0) {
            // 첫 번째 페이즈 (PIK 또는 PIP)
            const soundType = firstPhase === 'PIK' ? 'pik' : 'pip'
            playSound(soundType)
            addLog(`${firstPhase} (${rep + 1}회차 - ${time + 1}/${firstTime})`)
            time++
            currentStep++
            if (time >= firstTime) {
              phase = 1
              time = 0
            }
          } else {
            // 두 번째 페이즈 (PIP 또는 PIK)
            const soundType = secondPhase === 'PIK' ? 'pik' : 'pip'
            playSound(soundType)
            addLog(`${secondPhase} (${rep + 1}회차 - ${time + 1}/${secondTime})`)
            time++
            currentStep++
            if (time >= secondTime) {
              // 반복이 끝났으니 일단 멈추고 1초 후 카운트 로그 후 재개
              clearInterval(interval!)
              setTimeout(() => {
                rep++
                playCountSound(rep)
                addLog(koreanNumbers[rep] || rep.toString())
                // 다음 반복을 위해 interval 재시작
                startInterval()
              }, 1000)
              phase = 0
              time = 0
              // return을 통해 아래 코드 실행 방지
              return
            }
          }
        }, 1000)
      }

      startInterval()
    }

    logsRef.current = []
    setLogs([])
    runSet(1)
    
  }, [])

  // 운동 완료 후 선택 페이지로 이동
  const handleExerciseComplete = () => {
    setShowExerciseComplete(true)
  }

  const addAnotherExercise = () => {
    router.push({
      pathname: '/tempo',
      params: {
        tempos: tempos,
        exerciseStartTime: exerciseStartTime,
      },
    })
  }

  const finishAllExercises = () => {
    const allTempos = tempos ? JSON.parse(tempos) : []
    const totalExerciseTime = getCurrentElapsedTime()
    const totalSets = allTempos.reduce((sum: number, tempo: any) => {
      return sum + Number(tempo.setCount)
    }, 0)
    
    router.push({
      pathname: '/result',
      params: {
        tempos: tempos,
        totalExerciseTime: totalExerciseTime.toString(),
        totalSets: totalSets.toString(),
      },
    })
  }

  return (
    <View className="flex-1 bg-black">
      {/* 플로팅 경과시간 */}
      <View className="absolute top-12 left-0 right-0 z-10 bg-black/80 py-2 px-4">
        <Text className="text-white text-center text-lg font-semibold">
          총 경과시간: {formatElapsedTime(getCurrentElapsedTime())}
          현재 세트수: {currentSet}
        </Text>
      </View>
      
      {!showExerciseComplete ? (
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
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-white text-2xl font-bold mb-8 text-center">
            운동 완료!
          </Text>
          <Text className="text-white text-lg mb-12 text-center">
            다음 운동을 추가하시겠습니까?
          </Text>
          
          <View className="w-full space-y-4">
            <TouchableOpacity
              onPress={addAnotherExercise}
              className="bg-emerald-600 py-4 rounded-2xl"
            >
              <Text className="text-white text-center text-lg font-semibold">
                운동 추가
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={finishAllExercises}
              className="bg-zinc-700 py-4 rounded-2xl"
            >
              <Text className="text-white text-center text-lg font-semibold">
                운동 종료
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}
