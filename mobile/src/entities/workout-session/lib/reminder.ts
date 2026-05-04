import * as Notifications from "expo-notifications"
import i18n from "@/shared/i18n/i18n"
import { getLocalDateKey, getThisWeekDateRange } from "@/shared/lib/date"
import { buildWeeklyRoutineProgress } from "./weeklyRoutineProgress"
import {
  clearWorkoutReminderId,
  getStoredWorkoutSessionsInRange,
  getStoredWorkoutSessionIdByDate,
  getWorkoutReminderId,
  saveWorkoutReminderId,
} from "../model/sessionStorage"
import { normalizeWeeklyRoutineSettings } from "../model/weeklyRoutine"
import {
  loadWeeklyRoutineFeatureStatus,
  loadWeeklyRoutineSettings,
} from "../model/weeklyRoutineStorage"

// 매일 밤 22:00 기준으로 운동 리마인더를 발송한다.
const WORKOUT_REMINDER_HOUR = 22
const WORKOUT_REMINDER_MINUTE = 0

// 오늘 날짜(로컬) 기준 완료 운동 기록이 있는지 확인
async function hasWorkoutToday() {
  const todayDateKey = getLocalDateKey(new Date())
  const sessionId = await getStoredWorkoutSessionIdByDate(todayDateKey)
  return Boolean(sessionId)
}

// 다음 리마인더 발송 시각 계산:
// - 오늘 운동 완료 or 현재가 22:00 이후면 내일 22:00
// - 그 외에는 오늘 22:00
function getNextWorkoutReminderDate(workoutDoneToday: boolean) {
  const now = new Date()
  const next = new Date(now)
  next.setHours(WORKOUT_REMINDER_HOUR, WORKOUT_REMINDER_MINUTE, 0, 0)

  if (workoutDoneToday || next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }

  return next
}

/** 알림 권한이 있는지 확인하고, 없으면 사용자에게 요청 */
async function requestNotificationPermissions() {
  const permission = await Notifications.getPermissionsAsync()

  if (
    permission.granted ||
    permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true
  }

  const requested = await Notifications.requestPermissionsAsync()

  return (
    requested.granted ||
    requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  )
}

// 알림 본문 생성:
// - 루틴 ON + 설정 존재 시: "이번 주 남은 운동 횟수" 문구
// - 그 외: 기본 리마인더 문구
async function buildWorkoutReminderBody() {
  const fallbackBody = i18n.t("workout.reminder.body")

  try {
    const { startDateKey, endDateKey } = getThisWeekDateRange()
    const [featureStatus, settings, weekSessions] = await Promise.all([
      loadWeeklyRoutineFeatureStatus(),
      loadWeeklyRoutineSettings(),
      getStoredWorkoutSessionsInRange(startDateKey, endDateKey),
    ])

    if (featureStatus !== "enabled" || settings === null) {
      return fallbackBody
    }

    const normalizedSettings = normalizeWeeklyRoutineSettings(
      settings,
      startDateKey,
    )
    const progress = buildWeeklyRoutineProgress(
      normalizedSettings.sessions,
      weekSessions,
    )

    return i18n.t("workout.reminder.bodyRemaining", {
      remaining: progress.remainingSessions,
    })
  } catch {
    return fallbackBody
  }
}

/** 현재 저장된 운동 리마인더 하나만 찾아 예약 취소한다. */
export async function cancelScheduledWorkoutReminder() {
  const identifier = await getWorkoutReminderId()

  if (!identifier) {
    return
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier)
  } finally {
    await clearWorkoutReminderId()
  }
}

// 운동 리마인더를 정책에 맞게 재동기화:
// 1) 권한 확인
// 2) 기존 예약 취소
// 3) 다음 발송 시각으로 1건 재예약
export async function syncWorkoutReminderAtNight() {
  const granted = await requestNotificationPermissions()

  if (!granted) {
    // 권한이 없는 상태에서는 남아있는 예약을 정리
    await cancelScheduledWorkoutReminder()
    return null
  }

  await cancelScheduledWorkoutReminder()
  const workoutDoneToday = await hasWorkoutToday()
  const triggerDate = getNextWorkoutReminderDate(workoutDoneToday)
  const body = await buildWorkoutReminderBody()

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: i18n.t("workout.reminder.title"),
      body,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  })

  await saveWorkoutReminderId(identifier)
  return identifier
}

// 기존 API 호출부 호환용 alias (실제 동작은 22:00 정책 동기화)
export async function scheduleWorkoutReminder22h(_completedAtIso: string) {
  return syncWorkoutReminderAtNight()
}
