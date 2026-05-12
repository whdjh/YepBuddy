import { Alert, Linking, Platform } from "react-native"
import * as Calendar from "expo-calendar"
import i18n from "@/shared/i18n/i18n"
import {
  findYepBuddyCalendarId,
  YEPBUDDY_CALENDAR_COLOR,
  YEPBUDDY_CALENDAR_NAME,
  YEPBUDDY_CALENDAR_TITLE,
} from "./calendarRegistration"
import {
  appendCardioDurationToTitle,
  getCardioDurationMinutes,
} from "./cardioSession"
import { formatWorkoutLocationLabel } from "./locationLabel"
import { getWorkoutBodyPartSetLabel } from "../model/bodyPartSet"
import type { WorkoutBodyPartSet, WorkoutLocation } from "../model/types"

const BODY_PART_LABEL_KEYS: Record<WorkoutBodyPartSet["part"], string> = {
  chest: "workout.bodyParts.chest",
  back: "workout.bodyParts.back",
  legs: "workout.bodyParts.legs",
  shoulders: "workout.bodyParts.shoulders",
  arms: "workout.bodyParts.arms",
  core: "workout.bodyParts.core",
}

/** 운동 부위와 세트 수를 묶어 캘린더 이벤트 제목 문자열로 만듬 */
function formatWorkoutCalendarTitle(params: {
  bodyParts: WorkoutBodyPartSet[]
  cardioStartedAt?: string | null
  completedAt: string
}) {
  const bodyPartTitle =
    params.bodyParts.length === 0
      ? i18n.t("workout.calendar.defaultTitle")
      : params.bodyParts
          .map((item) => {
            const label = getWorkoutBodyPartSetLabel(item, {
              bodyPartLabel: (part) => i18n.t(BODY_PART_LABEL_KEYS[part]),
              bodyPartDetailLabel: (detail) =>
                i18n.t(`workout.bodyPartDetails.${detail}`),
            })
            return `${label}(${item.setCount})`
          })
          .join(", ")

  return appendCardioDurationToTitle({
    title: bodyPartTitle,
    cardioLabel: i18n.t("workout.calendar.cardio"),
    cardioMinutes: getCardioDurationMinutes({
      cardioStartedAt: params.cardioStartedAt,
      completedAt: params.completedAt,
    }),
  })
}

/** 새 캘린더를 만들 때 사용할 기기 기본 캘린더 소스를 가져옴 */
async function getDefaultCalendarSource(): Promise<Calendar.Source> {
  if (Platform.OS === "ios") {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync()
    return defaultCalendar.source
  }

  return {
    type: Calendar.SourceType.LOCAL,
    isLocalAccount: true,
    name: YEPBUDDY_CALENDAR_TITLE,
  }
}

/** Android 알림 채널을 포함한 단백질 할인 알림 1회성 예약 trigger 생성 */
function getWritableFallbackCalendarId(
  calendars: Calendar.Calendar[],
): string | null {
  const calendar = calendars.find((item) => item.allowsModifications)
  return calendar?.id ?? null
}

/** YepBuddy 전용 캘린더를 찾고, 없으면 앱 색상으로 새로 만듬 */
async function getOrCreateYepBuddyCalendarId() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
  const existingCalendarId = findYepBuddyCalendarId(calendars)

  if (existingCalendarId) {
    return existingCalendarId
  }

  const source = await getDefaultCalendarSource()
  const details: Partial<Calendar.Calendar> = {
    title: YEPBUDDY_CALENDAR_TITLE,
    color: YEPBUDDY_CALENDAR_COLOR,
    entityType: Calendar.EntityTypes.EVENT,
    source,
    name: YEPBUDDY_CALENDAR_NAME,
    ownerAccount: YEPBUDDY_CALENDAR_TITLE,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  }

  if (Platform.OS === "ios" && source.id) {
    details.sourceId = source.id
  }

  try {
    return await Calendar.createCalendarAsync(details)
  } catch {
    if (Platform.OS === "android") {
      return getWritableFallbackCalendarId(calendars)
    }

    return null
  }
}

/** 운동 캘린더 등록 실패 알림 표시 */
function showCalendarRegistrationFailureAlert() {
  Alert.alert(
    i18n.t("workout.calendar.failureTitle"),
    i18n.t("workout.calendar.failureBody"),
  )
}

/** 완료된 운동 세션을 기기 캘린더 이벤트로 등록 */
export async function registerWorkoutToCalendar(params: {
  startedAt: string
  completedAt: string
  cardioStartedAt?: string | null
  memo: string
  bodyParts: WorkoutBodyPartSet[]
  location?: WorkoutLocation | null
}) {
  const permission = await Calendar.getCalendarPermissionsAsync()
  let status = permission.status

  if (status !== "granted") {
    const requested = await Calendar.requestCalendarPermissionsAsync()
    status = requested.status
  }

  if (status !== "granted") {
    Alert.alert(
      i18n.t("workout.calendar.permissionTitle"),
      i18n.t("workout.calendar.permissionBody"),
      [
        { text: i18n.t("common.cancel"), style: "cancel" },
        {
          text: i18n.t("workout.calendar.openSettings"),
          onPress: () => void Linking.openSettings(),
        },
      ],
    )
    return false
  }

  let calendarId: string | null = null

  try {
    calendarId = await getOrCreateYepBuddyCalendarId()
  } catch {
    calendarId = null
  }

  if (!calendarId) {
    showCalendarRegistrationFailureAlert()
    return false
  }

  const startDate = new Date(params.startedAt)
  const endDate = new Date(params.completedAt)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return false
  }

  const eventLocation = params.location
    ? await formatWorkoutLocationLabel(params.location)
    : undefined

  try {
    await Calendar.createEventAsync(calendarId, {
      title: formatWorkoutCalendarTitle({
        bodyParts: params.bodyParts,
        cardioStartedAt: params.cardioStartedAt,
        completedAt: params.completedAt,
      }),
      startDate,
      endDate,
      notes: params.memo || undefined,
      location: eventLocation,
    })
  } catch {
    showCalendarRegistrationFailureAlert()
    return false
  }

  Alert.alert(
    i18n.t("workout.calendar.successTitle"),
    i18n.t("workout.calendar.successBody"),
  )
  return true
}
