import {
  NativeEventEmitter,
  NativeModules,
  Platform,
  type EmitterSubscription,
} from "react-native"
import type {
  WorkoutLiveStats,
  WorkoutSessionEndResult,
} from "../model/types"
import { EMPTY_WORKOUT_LIVE_STATS } from "../model/types"
import { normalizeWorkoutEndResult } from "../model/healthKitNormalization"
import {
  normalizeWorkoutLiveStats,
  type WorkoutMetricProvider,
} from "./workoutMetricsProvider"

// 네이티브 start 응답 payload
interface NativeWorkoutStartResult {
  started: boolean
  source: "iphoneLiveWorkout"
  status: WorkoutLiveStats["status"]
}

// 네이티브 end 응답 payload
interface NativeWorkoutEndResult {
  averageHeartRate?: number | null
  ended: boolean
  source: "iphoneLiveWorkout"
  status: "ended" | "error"
  workoutUUID?: string | null
}

// WorkoutSession 브리지 메서드 계약
interface NativeWorkoutSessionModule {
  discard: () => Promise<NativeWorkoutEndResult | boolean>
  end: () => Promise<NativeWorkoutEndResult | boolean>
  pause: () => Promise<boolean>
  readLiveStats: () => Promise<Partial<WorkoutLiveStats>>
  recover: () => Promise<NativeWorkoutStartResult | boolean>
  resume: () => Promise<boolean>
  start: () => Promise<NativeWorkoutStartResult | boolean>
}

// iOS 전용 네이티브 모듈 참조
const nativeModule =
  Platform.OS === "ios"
    ? (NativeModules.WorkoutSession as NativeWorkoutSessionModule | undefined)
    : undefined

// JS 이벤트 구독용 네이티브 emitter
const nativeEmitter =
  Platform.OS === "ios" && nativeModule
    ? new NativeEventEmitter(NativeModules.WorkoutSession)
    : null

function fromStatus(
  status: WorkoutLiveStats["status"],
  errorCode?: string | null,
): WorkoutLiveStats {
  // 상태 전용 LiveStats 기본 payload
  return {
    ...EMPTY_WORKOUT_LIVE_STATS,
    source: "iphoneLiveWorkout",
    status,
    updatedAt: new Date().toISOString(),
    errorCode: errorCode ?? null,
  }
}

// 네이티브 readLiveStats 안전 래퍼
async function safeRead(): Promise<WorkoutLiveStats> {
  if (!nativeModule) {
    // 네이티브 모듈 부재 error payload
    return normalizeWorkoutLiveStats({
      source: "iphoneLiveWorkout",
      status: "error",
      errorCode: "native_module_unavailable",
    })
  }

  try {
    // 네이티브 partial stats 표준 payload 정규화
    return normalizeWorkoutLiveStats({
      ...(await nativeModule.readLiveStats()),
      source: "iphoneLiveWorkout",
    })
  } catch {
    // 네이티브 read 실패 error payload
    return normalizeWorkoutLiveStats({
      source: "iphoneLiveWorkout",
      status: "error",
      errorCode: "read_failed",
    })
  }
}

// 진행 중인 iPhone live workout 세션을 저장 종료하고 완료 지표를 반환
export async function endIphoneLiveWorkout(): Promise<WorkoutSessionEndResult> {
  if (!nativeModule) {
    return {
      averageHeartRate: null,
      ended: false,
      healthKitWorkoutUUID: null,
    }
  }

  const ended = await nativeModule.end().catch(() => false)
  return normalizeWorkoutEndResult(ended)
}

// 진행 중인 iPhone live workout 세션을 저장 없이 폐기
export async function discardIphoneLiveWorkout() {
  if (!nativeModule) {
    return fromStatus("error", "native_module_unavailable")
  }

  // 네이티브 discard 실패 시 false로 fallback
  const discarded = await nativeModule.discard().catch(() => false)
  if (typeof discarded === "boolean") {
    // legacy boolean discard 응답 호환
    return fromStatus(
      discarded ? "ended" : "error",
      discarded ? null : "discard_failed",
    )
  }

  // 네이티브 discard 결과 표준 payload 변환
  return fromStatus(discarded.ended ? "ended" : "error")
}

// 종료/크래시 후 남아 있는 iPhone live workout 세션 복구
export async function recoverIphoneLiveWorkout() {
  if (!nativeModule) {
    return fromStatus("error", "native_module_unavailable")
  }

  try {
    const result = await nativeModule.recover()
    if (typeof result === "boolean") {
      return fromStatus(result ? "starting" : "idle")
    }

    return normalizeWorkoutLiveStats({
      source: "iphoneLiveWorkout",
      status: result.status,
      errorCode: result.started ? null : "recover_failed",
    })
  } catch {
    return fromStatus("error", "recover_failed")
  }
}

// iPhone live workout metric provider
export const iphoneLiveWorkoutProvider: WorkoutMetricProvider = {
  source: "iphoneLiveWorkout",

  // provider 사용 가능 조건
  isAvailable: () => Platform.OS === "ios" && Boolean(nativeModule),

  async start() {
    if (!nativeModule) {
      // 네이티브 모듈 부재 error payload
      return normalizeWorkoutLiveStats({
        source: "iphoneLiveWorkout",
        status: "error",
        errorCode: "native_module_unavailable",
      })
    }

    try {
      const result = await nativeModule.start()
      if (typeof result === "boolean") {
        // legacy boolean start 응답 호환
        return fromStatus(result ? "starting" : "error")
      }

      // 네이티브 start 결과 표준 payload 정규화
      return normalizeWorkoutLiveStats({
        source: "iphoneLiveWorkout",
        status: result.status,
        errorCode: result.started ? null : "start_failed",
      })
    } catch {
      return normalizeWorkoutLiveStats({
        source: "iphoneLiveWorkout",
        status: "error",
        errorCode: "start_failed",
      })
    }
  },

  async pause() {
    if (!nativeModule) {
      return fromStatus("error", "native_module_unavailable")
    }

    // 네이티브 pause 실패의 error 상태 변환
    const paused = await nativeModule.pause().catch(() => false)
    return fromStatus(paused ? "paused" : "error", paused ? null : "pause_failed")
  },

  async resume() {
    if (!nativeModule) {
      return fromStatus("error", "native_module_unavailable")
    }

    // 네이티브 resume 실패의 error 상태 변환
    const resumed = await nativeModule.resume().catch(() => false)
    return fromStatus(
      resumed ? "starting" : "error",
      resumed ? null : "resume_failed",
    )
  },

  async end() {
    const result = await endIphoneLiveWorkout()
    return fromStatus(
      result.ended ? "ended" : "error",
      result.ended ? null : "end_failed",
    )
  },

  read: safeRead,

  subscribe(listener) {
    if (!nativeEmitter) {
      // 네이티브 emitter 부재 no-op unsubscribe
      return () => undefined
    }

    // workoutStatsChanged 이벤트 구독 및 payload 정규화
    const subscription: EmitterSubscription = nativeEmitter.addListener(
      "workoutStatsChanged",
      (payload: Partial<WorkoutLiveStats>) => {
        listener(
          normalizeWorkoutLiveStats({
            ...payload,
            source: "iphoneLiveWorkout",
          }),
        )
      },
    )

    // React Native event subscription 해제
    return () => subscription.remove()
  },
}
