import { Platform } from "react-native"
const AppleHealthKit = require("react-native-health")
import type { WorkoutLiveStats } from "../model/types"

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

function hasHealthKitMethod(name: string) {
  return typeof AppleHealthKit?.[name] === "function"
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
