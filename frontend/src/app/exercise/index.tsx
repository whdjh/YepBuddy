import { Audio } from 'expo-av'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

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

  const [currentSet, setCurrentSet] = useState(1)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showExerciseComplete, setShowExerciseComplete] = useState(false)
  const [remainingRestTime, setRemainingRestTime] = useState<number | null>(null)
  const [totalSets, setTotalSets] = useState(0)
  const exerciseStartTimeRef = useRef<number>(0)
  const pikSoundRef = useRef<Audio.Sound | null>(null)
  const pipSoundRef = useRef<Audio.Sound | null>(null)
  const router = useRouter()

  // 소리 초기화
  useEffect(() => {
    const loadSounds = async () => {
      try {
        const { sound: pikSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep/pik.mp3')
        )
        pikSoundRef.current = pikSound

        const { sound: pipSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep/pip.mp3')
        )
        pipSoundRef.current = pipSound
      } catch (error) {
        console.log('소리 로드 실패:', error)
      }
    }

    loadSounds()

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
    setTotalSets(sets)

    const runSet = (setIndex: number) => {
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
                
                const remainingTime = rest - restElapsed
                setRemainingRestTime(remainingTime > 0 ? remainingTime : null)
                
                if (restElapsed >= rest) {
                  clearInterval(restInterval)
                  playRestSound('end')
                  setRemainingRestTime(null)
                  setCurrentSet(prev => prev + 1)
                  exerciseStartTimeRef.current = Date.now()
                  runSet(setIndex + 1)
                }
              }, 1000)
            } else {
              handleExerciseComplete()
            }
            return
          }

          if (phase === 0) {
            // 첫 번째 페이즈 (PIK 또는 PIP)
            const soundType = firstPhase === 'PIK' ? 'pik' : 'pip'
            playSound(soundType)
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
            time++
            currentStep++
            if (time >= secondTime) {
              // 반복이 끝났으니 일단 멈추고 1초 후 카운트 로그 후 재개
              clearInterval(interval!)
              setTimeout(() => {
                rep++
                playCountSound(rep)
                // 다음 반복을 위해 interval 재시작
                startInterval()
              }, 1000)
              phase = 0
              time = 0
              return
            }
          }
        }, 1000)
      }

      startInterval()
    }

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
      {!showExerciseComplete ? (
        <View className="flex-1 justify-center items-center px-6">
          {/* 총 경과시간 */}
          <View className="bg-black/80 p-6 rounded-2xl mb-8">
            <Text className="text-white text-2xl font-bold text-center">
              총 경과시간
            </Text>
            <Text className="text-white text-4xl font-bold text-center">
              {formatElapsedTime(getCurrentElapsedTime())}
            </Text>
          </View>

          {/* 남은 세트수 */}
          <View className="bg-emerald-600/80 p-6 rounded-2xl mb-8">
            <Text className="text-white text-xl font-semibold text-center">
              남은 세트수
            </Text>
            <Text className="text-white text-3xl font-bold text-center">
              {totalSets - currentSet + 1} / {totalSets}
            </Text>
          </View>

          {/* 남은 휴식시간 */}
          {remainingRestTime !== null && (
            <View className="bg-blue-600/80 p-6 rounded-2xl">
              <Text className="text-white text-xl font-semibold text-center">
                남은 휴식시간
              </Text>
              <Text className="text-white text-3xl font-bold text-center">
                {remainingRestTime}초
              </Text>
            </View>
          )}
        </View>
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
