import { useCallback, useRef, type Dispatch } from "react"
import { endWorkoutSession } from "../api/healthKit"
import { endWorkoutLiveActivity } from "../api/liveActivity"
import { processCompletedWorkoutCalendarAutoAdd } from "../lib/calendar"
import { rebuildAndSyncWorkoutPlaceArrivalReminder } from "../lib/workoutPlaceRebuild"
import { syncWorkoutReminderAtNight } from "../lib/reminder"
import { loadRoutineCycleProgressSnapshot } from "../lib/routineCycleProgressSnapshot"
import {
  buildCompletedWorkoutSession,
  getWorkoutCompletedAt,
} from "../lib/workoutCompletion"
import {
  clearCurrentWorkoutSnapshot,
  saveCompletedWorkoutSession,
  updateStoredWorkoutHealthKitMetrics,
} from "./sessionStorage"
import { markWorkoutPlaceReminderBlockedAt } from "./workoutPlaceReminderStorage"
import type { WorkoutRoutineSubstitution } from "./types"
import type { WorkoutAction, WorkoutState } from "./workoutState"

/** 운동 완료 세션 저장과 HealthKit·캘린더·알림 후처리 관리 */
export function useWorkoutCompletion({
  dispatch,
  state,
}: {
  dispatch: Dispatch<WorkoutAction>
  state: WorkoutState
}) {
  /** 같은 세션의 동시·순차 완료 요청을 한 번만 처리 */
  const completionSessionIdRef = useRef<string | null>(null)

  const completeWorkout = useCallback(
    async (
      options: {
        routineSubstitution?: WorkoutRoutineSubstitution | null
        isDeload?: boolean
      } = {},
    ) => {
      if (
        !state.sessionId ||
        !state.startedAt ||
        completionSessionIdRef.current === state.sessionId
      ) {
        return null
      }

      const completingSessionId = state.sessionId
      let sessionSaved = false
      completionSessionIdRef.current = completingSessionId
      try {
        const completedAt = getWorkoutCompletedAt({ pausedAt: state.pausedAt })
        const isDeload =
          options.isDeload ??
          (await loadRoutineCycleProgressSnapshot()
            .then((snapshot) => snapshot.isDeloadCycle)
            .catch(() => false))

        const session = buildCompletedWorkoutSession(
          {
            activeKcal: state.activeKcal,
            bodyParts: state.bodyParts,
            cardioStartedAt: state.cardioStartedAt,
            location: state.location,
            memo: state.memo,
            sessionId: state.sessionId,
            startedAt: state.startedAt,
            totalKcal: state.totalKcal,
          },
          completedAt,
          options.routineSubstitution ?? null,
          isDeload,
        )
        if (!session) {
          return null
        }

        await saveCompletedWorkoutSession(session)
        sessionSaved = true
        await markWorkoutPlaceReminderBlockedAt(completedAt).catch(
          () => undefined,
        )
        dispatch({ type: "COMPLETE", payload: { completedAt } })
        await clearCurrentWorkoutSnapshot()
        void rebuildAndSyncWorkoutPlaceArrivalReminder().catch(() => false)
        return session
      } finally {
        if (
          !sessionSaved &&
          completionSessionIdRef.current === completingSessionId
        ) {
          completionSessionIdRef.current = null
        }
      }
    },
    [
      dispatch,
      state.activeKcal,
      state.bodyParts,
      state.cardioStartedAt,
      state.location,
      state.memo,
      state.pausedAt,
      state.sessionId,
      state.startedAt,
      state.totalKcal,
    ],
  )

  const completeLiveActivityWorkout = useCallback(async () => {
    if (!state.sessionId || !state.startedAt) {
      return
    }

    const completedSession = await completeWorkout()
    if (!completedSession) {
      return
    }

    const endedWorkout = await endWorkoutSession({
      startedAt: completedSession.startedAt,
      endedAt: completedSession.completedAt,
      activeKcal: state.activeKcal,
      totalKcal: state.totalKcal,
    }).catch(() => false)

    if (endedWorkout && typeof endedWorkout !== "boolean") {
      await updateStoredWorkoutHealthKitMetrics(completedSession.sessionId, {
        averageHeartRate: endedWorkout.averageHeartRate,
        healthKitWorkoutUUID: endedWorkout.healthKitWorkoutUUID,
      }).catch(() => undefined)
    }

    await syncWorkoutReminderAtNight({ allowPrompt: false }).catch(() => false)
    await processCompletedWorkoutCalendarAutoAdd(
      completedSession,
      "background",
    ).catch(() => false)
    await endWorkoutLiveActivity().catch(() => false)
  }, [
    completeWorkout,
    state.activeKcal,
    state.sessionId,
    state.startedAt,
    state.totalKcal,
  ])

  return { completeLiveActivityWorkout, completeWorkout }
}
