import { useCallback, useEffect, useRef, useState } from "react"
import { AppState } from "react-native"
import {
  calculateTempoPosition,
  type TempoSettings,
} from "./tempoCalculator"
import {
  initAudio,
  cleanupAudio,
  playContractionTick,
  playRelaxationTick,
  playRestStart,
  playRestWarning,
  playCount,
  playComplete,
} from "./tempoSound"

type TempoStatus = "idle" | "countdown" | "contraction" | "relaxation" | "rest" | "count"

const COUNTDOWN_MS = 30_000

interface UseTempoTimerReturn {
  status: TempoStatus
  currentSet: number
  currentRep: number
  progress: number
  remainingRest: number | null
  countdownRemaining: number | null
  isRunning: boolean
  start: () => void
}

export function useTempoTimer(settings: TempoSettings): UseTempoTimerReturn {
  const [status, setStatus] = useState<TempoStatus>("idle")
  const [currentSet, setCurrentSet] = useState(0)
  const [currentRep, setCurrentRep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [remainingRest, setRemainingRest] = useState<number | null>(null)
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const startedAtRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const isStartingRef = useRef(false)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const prevPositionRef = useRef<{
    phase: string
    currentSet: number
    currentRep: number
    lastTickSecond: number
  } | null>(null)

  const stop = useCallback(() => {
    setStatus("idle")
    setCurrentSet(0)
    setCurrentRep(0)
    setProgress(0)
    setRemainingRest(null)
    setCountdownRemaining(null)
    setIsRunning(false)
    isStartingRef.current = false
    startedAtRef.current = null
    prevPositionRef.current = null
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    if (startedAtRef.current === null) return

    const rawElapsed = Date.now() - startedAtRef.current

    // 카운트다운 단계
    if (rawElapsed < COUNTDOWN_MS) {
      const remaining = Math.ceil((COUNTDOWN_MS - rawElapsed) / 1000)
      setStatus("countdown")
      setCountdownRemaining(remaining)
      setProgress(rawElapsed / COUNTDOWN_MS)
      setCurrentSet(0)
      setCurrentRep(0)
      setRemainingRest(null)

      // 잔여 10초 경고음 재생
      const prev = prevPositionRef.current
      const currentSecond = Math.floor(rawElapsed / 1000)
      if (remaining === 10 && (prev === null || currentSecond > prev.lastTickSecond)) {
        playRestWarning()
      }
      prevPositionRef.current = {
        phase: "countdown",
        currentSet: 0,
        currentRep: 0,
        lastTickSecond: currentSecond,
      }
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    // 카운트다운 → 템포 전환 시 이전 상태 초기화
    if (prevPositionRef.current?.phase === "countdown") {
      prevPositionRef.current = null
    }

    setCountdownRemaining(null)
    const elapsed = rawElapsed - COUNTDOWN_MS
    const position = calculateTempoPosition(elapsed, settingsRef.current)

    if (position.isFinished) {
      stop()
      playComplete()
      return
    }

    // UI 상태 업데이트
    setStatus(position.phase)
    setCurrentSet(position.currentSet)
    setCurrentRep(position.currentRep)
    setProgress(position.phaseElapsed / position.phaseDuration)
    setRemainingRest(position.remainingRest)

    // 사운드/햅틱 — 초당 1회만 실행
    const prev = prevPositionRef.current
    const currentSecond = Math.floor(elapsed / 1000)

    if (prev === null || currentSecond > prev.lastTickSecond) {
      const phaseChanged = prev !== null && prev.phase !== position.phase

      if (phaseChanged || prev === null) {
        if (position.phase === "rest") {
          playRestStart()
        }
      }

      // 단계별 사운드 재생
      if (position.phase === "contraction") {
        playContractionTick()
      } else if (position.phase === "relaxation") {
        playRelaxationTick()
      } else if (position.phase === "count") {
        playCount(position.currentRep)
      }

      if (position.phase === "rest" && position.remainingRest === 10) {
        playRestWarning()
      }
    }

    prevPositionRef.current = {
      phase: position.phase,
      currentSet: position.currentSet,
      currentRep: position.currentRep,
      lastTickSecond: currentSecond,
    }

    // 다음 프레임 예약
    rafRef.current = requestAnimationFrame(tick)
  }, [stop])

  const start = useCallback(() => {
    if (isStartingRef.current || isRunning) {
      return
    }

    isStartingRef.current = true

    void initAudio()
      .catch((error) => {
        console.warn("Failed to initialize tempo audio", error)
      })
      .finally(() => {
        startedAtRef.current = Date.now()
        prevPositionRef.current = null
        setIsRunning(true)
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
        }
        rafRef.current = requestAnimationFrame(tick)
        isStartingRef.current = false
      })
  }, [isRunning, tick])

  // 화면을 떠날 때만 오디오 리소스를 정리한다.
  useEffect(() => {
    return () => {
      void cleanupAudio()
    }
  }, [])

  // 언마운트 시 raf 정리
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // 백그라운드 복귀 시 타이머 동기화
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && startedAtRef.current !== null) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current)
        }
        rafRef.current = requestAnimationFrame(tick)
      }
    })
    return () => subscription.remove()
  }, [tick])

  return {
    status,
    currentSet,
    currentRep,
    progress,
    remainingRest,
    countdownRemaining,
    isRunning,
    start,
  }
}
