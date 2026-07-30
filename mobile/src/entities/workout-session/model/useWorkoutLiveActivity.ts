import { AppState } from "react-native"
import { useCallback, useEffect, type Dispatch } from "react"
import i18n from "@/shared/i18n/i18n"
import {
  consumeWorkoutLiveActivityCommands,
  endWorkoutLiveActivity,
  startWorkoutLiveActivity,
} from "../api/liveActivity"
import { getWorkoutLiveActivityTiming } from "../lib/liveActivityTiming"
import type { WorkoutAction, WorkoutState } from "./workoutState"

/** Live Activity에 표시할 현재 운동 상태 문구 반환 */
function getWorkoutLiveActivityStatusText(params: {
  cardioStartedAt: string | null
  phase: WorkoutState["phase"]
}) {
  if (params.phase === "paused") {
    return i18n.t(
      params.cardioStartedAt
        ? "workout.liveActivity.cardioPaused"
        : "workout.liveActivity.workoutPaused",
    )
  }

  return i18n.t(
    params.cardioStartedAt
      ? "workout.liveActivity.cardioRecording"
      : "workout.liveActivity.workoutRecording",
  )
}

/** 운동 상태와 Live Activity 표시·외부 명령을 양방향으로 동기화 */
export function useWorkoutLiveActivity({
  completeLiveActivityWorkout,
  dispatch,
  isHydrated,
  state,
}: {
  completeLiveActivityWorkout: () => Promise<void>
  dispatch: Dispatch<WorkoutAction>
  isHydrated: boolean
  state: WorkoutState
}) {
  useEffect(() => {
    if (!isHydrated) {
      return
    }

    if (
      (state.phase === "recording" || state.phase === "paused") &&
      state.sessionId
    ) {
      const timing = getWorkoutLiveActivityTiming({
        pausedAt: state.pausedAt,
        pausedDuration: state.pausedDuration,
        phase: state.phase,
        startedAt: state.startedAt,
      })

      if (!timing) {
        return
      }

      void startWorkoutLiveActivity({
        cardioStartedAt: state.cardioStartedAt,
        heartRate: state.heartRate,
        sessionId: state.sessionId,
        statusText: getWorkoutLiveActivityStatusText({
          cardioStartedAt: state.cardioStartedAt,
          phase: state.phase,
        }),
        timerPausedAt: timing.timerPausedAt,
        timerStartAt: timing.timerStartAt,
      })
      return
    }

    void endWorkoutLiveActivity()
  }, [
    isHydrated,
    state.cardioStartedAt,
    state.heartRate,
    state.pausedAt,
    state.pausedDuration,
    state.phase,
    state.sessionId,
    state.startedAt,
  ])

  const consumeLiveActivityCommands = useCallback(async () => {
    if (
      !isHydrated ||
      !state.sessionId ||
      (state.phase !== "recording" && state.phase !== "paused")
    ) {
      return
    }

    const commands = await consumeWorkoutLiveActivityCommands()
    for (const command of commands) {
      if (command.sessionId !== state.sessionId) {
        continue
      }

      if (command.command === "pause") {
        dispatch({ type: "PAUSE", payload: { pausedAt: command.createdAt } })
      } else if (command.command === "resume") {
        dispatch({ type: "RESUME", payload: { resumedAt: command.createdAt } })
      } else if (command.command === "startCardio") {
        if (!state.cardioStartedAt && state.phase === "recording") {
          dispatch({
            type: "START_CARDIO",
            payload: { cardioStartedAt: command.createdAt },
          })
        }
      } else {
        await completeLiveActivityWorkout()
      }
    }
  }, [
    completeLiveActivityWorkout,
    dispatch,
    isHydrated,
    state.cardioStartedAt,
    state.phase,
    state.sessionId,
  ])

  useEffect(() => {
    void consumeLiveActivityCommands()

    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") {
        void consumeLiveActivityCommands()
      }
    })

    return () => subscription.remove()
  }, [consumeLiveActivityCommands])

  useEffect(() => {
    if (
      !isHydrated ||
      !state.sessionId ||
      (state.phase !== "recording" && state.phase !== "paused")
    ) {
      return
    }

    const timer = setInterval(() => {
      void consumeLiveActivityCommands()
    }, 1000)

    return () => clearInterval(timer)
  }, [
    consumeLiveActivityCommands,
    isHydrated,
    state.phase,
    state.sessionId,
  ])
}
