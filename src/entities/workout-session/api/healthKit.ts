import { Platform } from "react-native"
import AppleHealthKit, {
  type HealthValue,
  type HKWorkoutQueriedSampleType,
} from "react-native-health"
import { getIsoAfterHours, getTimeDistanceMs } from "@/shared/lib/date"
import type {
  WorkoutHealthKitDetail,
  WorkoutHeartRateSample,
  WorkoutLiveStats,
} from "../model/types"

const HEALTH_PERMISSIONS = {
  permissions: {
    read: ["HeartRate", "ActiveEnergyBurned", "BasalEnergyBurned"],
    write: ["Workout"],
  },
} as const

let healthKitInitialized = false

function isHealthKitAvailable() {
  return Platform.OS === "ios"
}

function hasHealthKitMethod(name: keyof typeof AppleHealthKit) {
  return typeof AppleHealthKit?.[name] === "function"
}

async function getWorkoutSamples(params: {
  endDate: string
  startDate: string
}) {
  if (!hasHealthKitMethod("getAnchoredWorkouts")) {
    return []
  }

  return new Promise<HKWorkoutQueriedSampleType[]>((resolve) => {
    AppleHealthKit.getAnchoredWorkouts(
      {
        endDate: params.endDate,
        startDate: params.startDate,
        type: "Workout",
      } as never,
      (
        error: { message?: string } | null,
        results?: { data?: HKWorkoutQueriedSampleType[] },
      ) => {
        if (error) {
          resolve([])
          return
        }

        resolve(results?.data ?? [])
      },
    )
  })
}

async function getHeartRateSamples(params: {
  endDate: string
  startDate: string
}) {
  if (!hasHealthKitMethod("getHeartRateSamples")) {
    return []
  }

  return new Promise<WorkoutHeartRateSample[]>((resolve) => {
    AppleHealthKit.getHeartRateSamples(
      {
        ascending: true,
        endDate: params.endDate,
        startDate: params.startDate,
        unit: "bpm",
      } as never,
      (error: unknown, results?: HealthValue[]) => {
        if (error) {
          resolve([])
          return
        }

        resolve(
          (results ?? []).map((sample) => ({
            bpm: Math.round(sample.value),
            endDate: sample.endDate,
            startDate: sample.startDate,
          })),
        )
      },
    )
  })
}

export async function initHealthKit() {
  if (!isHealthKitAvailable() || healthKitInitialized) {
    return healthKitInitialized
  }

  // 시뮬레이터나 현재 런타임에서 네이티브 메서드가 비어 있으면 false로 처리한다.
  if (!hasHealthKitMethod("initHealthKit")) {
    return false
  }

  return new Promise<boolean>((resolve) => {
    AppleHealthKit.initHealthKit(
      HEALTH_PERMISSIONS as never,
      (error: unknown) => {
        healthKitInitialized = !error
        resolve(!error)
      },
    )
  })
}

export async function startWorkoutSession() {
  await initHealthKit()
}

export async function pauseWorkoutSession() {
  // react-native-health만으로는 여기서 신뢰할 수 있는 실시간 pause API를 쓰기 어려우므로 우선 앱의 일시정지 상태만 유지하고, HealthKit은 종료 시점 저장으로 처리
  return
}

export async function resumeWorkoutSession() {
  // react-native-health만으로는 여기서 신뢰할 수 있는 실시간 pause API를 쓰기 어려우므로 우선 앱의 일시정지 상태만 유지하고, HealthKit은 종료 시점 저장으로 처리
  return
}

export async function endWorkoutSession(params: {
  startedAt: string
  endedAt: string
  activeKcal: number
  totalKcal: number
}) {
  const ready = await initHealthKit()
  if (!ready || !hasHealthKitMethod("saveWorkout")) {
    return false
  }

  return new Promise<boolean>((resolve) => {
    AppleHealthKit.saveWorkout(
      {
        startDate: params.startedAt,
        endDate: params.endedAt,
        activityType: "TraditionalStrengthTraining",
        energyBurned: params.activeKcal || params.totalKcal || 0,
      } as never,
      (error: unknown) => resolve(!error),
    )
  })
}

export async function readLiveWorkoutStats(): Promise<WorkoutLiveStats> {
  const ready = await initHealthKit()
  if (!ready || !hasHealthKitMethod("getHeartRateSamples")) {
    return { heartRate: null, activeKcal: 0, totalKcal: 0 }
  }

  return new Promise<WorkoutLiveStats>((resolve) => {
    AppleHealthKit.getHeartRateSamples(
      {
        startDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
        limit: 1,
      } as never,
      (error: unknown, results?: { value?: number }[]) => {
        if (error) {
          resolve({ heartRate: null, activeKcal: 0, totalKcal: 0 })
          return
        }

        const sample = results?.[0]
        resolve({
          heartRate:
            typeof sample?.value === "number" ? Math.round(sample.value) : null,
          activeKcal: 0,
          totalKcal: 0,
        })
      },
    )
  })
}

export async function getWorkoutDetail(
  sessionId: string,
): Promise<WorkoutHealthKitDetail | null> {
  const ready = await initHealthKit()
  if (!ready) {
    return null
  }

  const startedAtMs = new Date(sessionId).getTime()
  if (Number.isNaN(startedAtMs)) {
    return null
  }

  const workoutSamples = await getWorkoutSamples({
    endDate: getIsoAfterHours(sessionId, 24),
    startDate: sessionId,
  })

  const workout = workoutSamples
    .filter((sample) => Boolean(sample.start))
    .sort(
      (left, right) =>
        getTimeDistanceMs(left.start, sessionId) -
        getTimeDistanceMs(right.start, sessionId),
    )[0]

  if (!workout) {
    return null
  }

  const heartRateSamples = await getHeartRateSamples({
    endDate: workout.end,
    startDate: workout.start,
  })

  return {
    activeKcal:
      typeof workout.calories === "number" ? Math.round(workout.calories) : null,
    duration:
      typeof workout.duration === "number" ? Math.round(workout.duration) : null,
    heartRateSamples,
    totalKcal:
      typeof workout.calories === "number" ? Math.round(workout.calories) : null,
  }
}
