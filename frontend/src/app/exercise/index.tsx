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

export default function ExercisePage() {
  const {
    startWith,
    concentricTime,
    eccentricTime,
    reps,
    restTime,
    setCount,
    tempos,
    exerciseStartTime,
  } = useLocalSearchParams<{
    startWith: 'concentric' | 'eccentric'
    concentricTime: string
    eccentricTime: string
    reps: string
    restTime: string
    setCount: string
    tempos: string
    exerciseStartTime: string
  }>()

  const [currentSet, setCurrentSet] = useState(1)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showExerciseComplete, setShowExerciseComplete] = useState(false)
  const [remainingRestTime, setRemainingRestTime] = useState<number | null>(null)
  const [totalSets, setTotalSets] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isExerciseRunning, setIsExerciseRunning] = useState(false)
  const exerciseStartTimeRef = useRef<number>(0)
  const pikSoundRef = useRef<Audio.Sound | null>(null)
  const pipSoundRef = useRef<Audio.Sound | null>(null)
  const restStartSoundRef = useRef<Audio.Sound | null>(null)
  const restEndSoundRef = useRef<Audio.Sound | null>(null)
  const countSoundsRef = useRef<{ [key: number]: Audio.Sound | null }>({})
  const router = useRouter()

  // 소리 초기화
  useEffect(() => {
    const loadSounds = async () => {
      try {
        console.log('소리 로드 시작...')
        
        // 기본 비프 소리 로드
        const { sound: pikSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep/pik.mp3'),
          { shouldPlay: false, volume: 1.0 }
        )
        await pikSound.setStatusAsync({ shouldPlay: false, volume: 1.0 })
        pikSoundRef.current = pikSound
        console.log('pik 소리 로드 완료')

        const { sound: pipSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/beep/pip.mp3'),
          { shouldPlay: false, volume: 1.0 }
        )
        await pipSound.setStatusAsync({ shouldPlay: false, volume: 1.0 })
        pipSoundRef.current = pipSound
        console.log('pip 소리 로드 완료')

        // 휴식 소리 로드
        const { sound: restStartSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/rest/start.mp3'),
          { shouldPlay: false, volume: 1.0 }
        )
        await restStartSound.setStatusAsync({ shouldPlay: false, volume: 1.0 })
        restStartSoundRef.current = restStartSound
        console.log('휴식 시작 소리 로드 완료')

        const { sound: restEndSound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/rest/end.mp3'),
          { shouldPlay: false, volume: 1.0 }
        )
        await restEndSound.setStatusAsync({ shouldPlay: false, volume: 1.0 })
        restEndSoundRef.current = restEndSound
        console.log('휴식 종료 소리 로드 완료')

        // 카운트 소리들 로드
        console.log('카운트 소리 로드 시작...')
        for (let i = 1; i <= 20; i++) {
          const soundFile = countSounds[i]
          if (soundFile) {
            const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: false, volume: 1.0 })
            await sound.setStatusAsync({ shouldPlay: false, volume: 1.0 })
            countSoundsRef.current[i] = sound
          }
        }
        console.log('카운트 소리 로드 완료')
        
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
      if (restStartSoundRef.current) {
        restStartSoundRef.current.unloadAsync()
      }
      if (restEndSoundRef.current) {
        restEndSoundRef.current.unloadAsync()
      }
      // 카운트 소리들 정리
      Object.values(countSoundsRef.current).forEach(sound => {
        if (sound) {
          sound.unloadAsync()
        }
      })
    }
  }, [])

  // 소리 재생 함수 (개선된 버전)
  const playSound = async (type: 'pik' | 'pip') => {
    try {
      const sound = type === 'pik' ? pikSoundRef.current : pipSoundRef.current
      if (sound) {
        const status = await sound.getStatusAsync()
        if (status.isLoaded) {
          // 소리가 재생 중이면 먼저 정지
          if (status.isPlaying) {
            await sound.stopAsync()
          }
          // 위치를 처음으로 되돌리고 재생
          await sound.setPositionAsync(0)
          await sound.playAsync()
        } else {
          console.log(`${type} 소리가 로드되지 않음`)
        }
      } else {
        console.log(`${type} 소리 참조가 없음`)
      }
    } catch (error) {
      console.log('소리 재생 실패:', error)
    }
  }

  // 숫자 카운트 소리 재생 함수 (개선된 버전)
  const playCountSound = async (num: number) => {
    try {
      const sound = countSoundsRef.current[num]
      if (sound) {
        const status = await sound.getStatusAsync()
        if (status.isLoaded) {
          // 소리가 재생 중이면 먼저 정지
          if (status.isPlaying) {
            await sound.stopAsync()
          }
          // 위치를 처음으로 되돌리고 재생
          await sound.setPositionAsync(0)
          await sound.playAsync()
        } else {
          console.log(`${num} 카운트 소리가 로드되지 않음`)
        }
      } else {
        console.log(`${num} 카운트 소리 참조가 없음`)
      }
    } catch (error) {
      console.log('카운트 소리 재생 실패:', error)
    }
  }

  // 휴식 소리 재생 함수 (개선된 버전)
  const playRestSound = async (type: 'start' | 'end') => {
    try {
      const sound = type === 'start' ? restStartSoundRef.current : restEndSoundRef.current
      if (sound) {
        const status = await sound.getStatusAsync()
        if (status.isLoaded) {
          // 소리가 재생 중이면 먼저 정지
          if (status.isPlaying) {
            await sound.stopAsync()
          }
          // 위치를 처음으로 되돌리고 재생
          await sound.setPositionAsync(0)
          await sound.playAsync()
        } else {
          console.log(`${type} 휴식 소리가 로드되지 않음`)
        }
      } else {
        console.log(`${type} 휴식 소리 참조가 없음`)
      }
    } catch (error) {
      console.log('휴식 소리 재생 실패:', error)
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

  // 경과시간 실시간 업데이트
  useEffect(() => {
    if (!startTime) return

    const timer = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedTime(elapsed)
    }, 100)

    return () => clearInterval(timer)
  }, [startTime])

  // 개선된 운동 실행 로직 (말씀하신 for문 기반)
  const runExercise = async () => {
    const sets = Number(setCount)
    const repsCount = Number(reps)
    const concentric = Number(concentricTime)
    const eccentric = Number(eccentricTime)
    const rest = Number(restTime)

    console.log('운동 시작:', { sets, repsCount, concentric, eccentric, rest, startWith })

    // 시작 시간 설정
    const startTimeValue = exerciseStartTime ? new Date(Number(exerciseStartTime)) : new Date()
    setStartTime(startTimeValue)
    exerciseStartTimeRef.current = Number(exerciseStartTime) || Date.now()
    setTotalSets(sets)
    setIsExerciseRunning(true)

    // 세트 반복
    for (let set = 1; set <= sets; set++) {
      console.log(`세트 ${set} 시작`)
      setCurrentSet(set)
      
      // 반복 횟수만큼 반복
      for (let rep = 1; rep <= repsCount; rep++) {
        console.log(`반복 ${rep} 시작`)
        
        // 수축/이완 사이클
        if (startWith === 'concentric') {
          // 수축 → 이완 순서
          console.log('수축 시작')
          for (let i = 0; i < concentric; i++) {
            await playSound('pik')
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          
          console.log('이완 시작')
          for (let i = 0; i < eccentric; i++) {
            await playSound('pip')
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } else {
          // 이완 → 수축 순서
          console.log('이완 시작')
          for (let i = 0; i < eccentric; i++) {
            await playSound('pip')
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
          
          console.log('수축 시작')
          for (let i = 0; i < concentric; i++) {
            await playSound('pik')
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
        
        // 반복 완료 시 카운트 소리 (1-20까지만)
        if (rep <= 20) {
          console.log(`반복 ${rep} 완료, 카운트 소리 재생`)
          await playCountSound(rep)
          // 카운트 소리 재생 후 1초 대기
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      // 세트 완료 후 휴식 (마지막 세트 제외)
      if (set < sets) {
        console.log(`세트 ${set} 완료, 휴식 시작`)
        await playRestSound('start')
        
        let countdownStarted = false
        
        for (let i = 0; i < rest; i++) {
          const remainingTime = rest - i
          setRemainingRestTime(remainingTime)
          
          // 휴식 종료 10초 전에 휴식 종료 소리 재생하고 카운트다운 시작
          if (remainingTime === 10 && !countdownStarted) {
            console.log(`휴식 종료 10초 전, 휴식 종료 소리 재생`)
            await playRestSound('end')
            countdownStarted = true
            
            // 휴식 종료 소리 재생 후 10초부터 1초까지 카운트다운 시작 (별도로 실행)
            setTimeout(async () => {
              for (let j = 10; j >= 1; j--) {
                console.log(`운동 시작 ${j}초 전`)
                await playCountSound(j)
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            }, 0)
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // 휴식 완료 후 남은 휴식시간 UI 제거
        setRemainingRestTime(null)
        console.log(`휴식 완료`)
      }
    }
    
    // 운동 완료
    console.log('운동 완료')
    setIsExerciseRunning(false)
    handleExerciseComplete()
  }

  // 운동 시작
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
    ) {
      console.log('유효하지 않은 파라미터:', { startWith, concentric, eccentric, repsCount, rest, sets })
      return
    }

    // 소리가 로드된 후 운동 시작
    const checkSoundsLoaded = () => {
      if (pikSoundRef.current && pipSoundRef.current && restStartSoundRef.current && restEndSoundRef.current) {
        console.log('모든 소리 로드 완료, 운동 시작')
        runExercise()
      } else {
        console.log('소리 로드 대기 중...')
        setTimeout(checkSoundsLoaded, 100)
      }
    }

    checkSoundsLoaded()
  }, [startWith, concentricTime, eccentricTime, reps, restTime, setCount])

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
    const totalExerciseTime = elapsedTime
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
              {formatElapsedTime(elapsedTime)}
            </Text>
          </View>

          {/* 남은 세트수 */}
          <View className="bg-emerald-600/80 p-6 rounded-2xl mb-8">
            <Text className="text-white text-xl font-semibold text-center">
              남은 세트수
            </Text>
            <Text className="text-white text-3xl font-bold text-center">
              {totalSets - currentSet}
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

          {/* 운동 상태 표시 */}
          {isExerciseRunning && (
            <View className="bg-orange-600/80 p-4 rounded-2xl mt-4">
              <Text className="text-white text-lg font-semibold text-center">
                운동 진행 중...
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
