import { Alert, Platform } from "react-native"
import * as Calendar from "expo-calendar"
import i18n from "@/shared/i18n/i18n"
import {
  getCalendarAutoAddPreference,
  setCalendarAutoAddPreference,
} from "../model/workoutPreferenceStorage"
import {
  updateStoredWorkoutCalendarEventId,
} from "../model/storedWorkoutSessionStorage"
import type {
  StoredWorkoutSession,
  WorkoutBodyPartSet,
  WorkoutLocation,
} from "../model/types"
import {
  findYepBuddyCalendarId,
  YEPBUDDY_CALENDAR_COLOR,
  YEPBUDDY_CALENDAR_NAME,
  YEPBUDDY_CALENDAR_TITLE,
} from "./calendarRegistration"
import {
  getCalendarAutoAddDecision,
  type WorkoutCompletionSource,
} from "./calendarAutoAdd"
import {
  promptCalendarAutoAddPreference,
  type CalendarAutoAddPromptHandlers,
} from "./calendarAutoAddPrompt"
import { formatWorkoutLocationLabel } from "./locationLabel"
import { formatWorkoutCalendarTitle } from "./calendarTitle"

const LEGACY_EVENT_SEARCH_PADDING_MS = 24 * 60 * 60 * 1000
const LEGACY_EVENT_TIMESTAMP_TOLERANCE_MS = 1000
const CALENDAR_TITLE_LANGUAGES = ["ko", "en"] as const

type WorkoutCalendarUpdateStatus =
  | "updated"
  | "notFound"
  | "unlinked"
  | "permissionDenied"
  | "failed"

type WorkoutCalendarDeleteStatus =
  | "deleted"
  | "notFound"
  | "unlinked"
  | "permissionDenied"
  | "failed"

type WorkoutCalendarLookupStatus = Exclude<
  WorkoutCalendarUpdateStatus,
  "updated"
>

type WorkoutCalendarEventLookup =
  | { status: "found"; event: Calendar.Event }
  | { status: WorkoutCalendarLookupStatus }

const BODY_PART_LABEL_KEYS: Record<WorkoutBodyPartSet["part"], string> = {
  chest: "workout.bodyParts.chest",
  back: "workout.bodyParts.back",
  legs: "workout.bodyParts.legs",
  shoulders: "workout.bodyParts.shoulders",
  arms: "workout.bodyParts.arms",
  core: "workout.bodyParts.core",
}

/** 저장 세션을 현재 언어의 캘린더 제목으로 변환 */
function getWorkoutCalendarTitle(
  session: Pick<
    StoredWorkoutSession,
    "bodyParts" | "cardioStartedAt" | "completedAt" | "isDeload"
  >,
  language?: (typeof CALENDAR_TITLE_LANGUAGES)[number],
) {
  const translate = (key: string) =>
    language ? i18n.t(key, { lng: language }) : i18n.t(key)

  return formatWorkoutCalendarTitle(
    session,
    {
      bodyPartLabel: (part) => translate(BODY_PART_LABEL_KEYS[part]),
      bodyPartDetailLabel: (detail) =>
        translate(`workout.bodyPartDetails.${detail}`),
      cardioLabel: translate("workout.calendar.cardio"),
      cardioMinuteUnit: translate("summary.minuteUnit"),
      defaultTitle: translate("workout.calendar.defaultTitle"),
      deloadLabel: translate("workout.routineCycle.status.deload"),
    },
  )
}

function getCalendarFailureStatus(error: unknown): WorkoutCalendarLookupStatus {
  const calendarError = error as
    | { code?: unknown; message?: unknown }
    | null
    | undefined
  const code =
    typeof calendarError?.code === "string"
      ? calendarError.code.toUpperCase()
      : ""
  const message =
    typeof calendarError?.message === "string"
      ? calendarError.message.toLowerCase()
      : ""

  if (code.includes("PERMISSION") || message.includes("permission is required")) {
    return "permissionDenied"
  }

  if (
    code.includes("EVENT_NOT_FOUND") ||
    code.includes("ITEM_NO_LONGER_EXISTS") ||
    (message.includes("event with id") &&
      message.includes("could not be found")) ||
    message.includes("calendar item no longer exists")
  ) {
    return "notFound"
  }

  return "failed"
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

/** 캘린더 이벤트 쓰기 권한 보유 여부 */
export async function hasCalendarEventWritePermission() {
  const permission = await Calendar.getCalendarPermissionsAsync()
  return permission.status === "granted"
}

/** 사용자 액션 직후 캘린더 이벤트 쓰기 권한 요청 */
export async function requestCalendarEventWritePermission() {
  const permission = await Calendar.requestCalendarPermissionsAsync()
  return permission.status === "granted"
}

async function getCalendarEventById(
  calendarEventId: string,
): Promise<WorkoutCalendarEventLookup> {
  try {
    return {
      status: "found",
      event: await Calendar.getEventAsync(calendarEventId),
    }
  } catch (error) {
    return { status: getCalendarFailureStatus(error) }
  }
}

async function findLegacyWorkoutCalendarEvent(
  session: StoredWorkoutSession,
): Promise<WorkoutCalendarEventLookup> {
  const startedAtMs = new Date(session.startedAt).getTime()
  const completedAtMs = new Date(session.completedAt).getTime()
  if (
    !Number.isFinite(startedAtMs) ||
    !Number.isFinite(completedAtMs) ||
    completedAtMs < startedAtMs
  ) {
    return { status: "failed" }
  }

  try {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT)
    const calendarId = findYepBuddyCalendarId(calendars)
    if (!calendarId) {
      return { status: "unlinked" }
    }

    const events = await Calendar.getEventsAsync(
      [calendarId],
      new Date(startedAtMs - LEGACY_EVENT_SEARCH_PADDING_MS),
      new Date(completedAtMs + LEGACY_EVENT_SEARCH_PADDING_MS),
    )
    const expectedTitles = new Set(
      CALENDAR_TITLE_LANGUAGES.map((language) =>
        getWorkoutCalendarTitle(session, language),
      ),
    )
    const matches = events.filter(
      (event) =>
        expectedTitles.has(event.title) &&
        Math.abs(new Date(event.startDate).getTime() - startedAtMs) <=
          LEGACY_EVENT_TIMESTAMP_TOLERANCE_MS &&
        Math.abs(new Date(event.endDate).getTime() - completedAtMs) <=
          LEGACY_EVENT_TIMESTAMP_TOLERANCE_MS,
    )

    if (matches.length !== 1) {
      return { status: "unlinked" }
    }

    const [event] = matches
    const linkedSession = await updateStoredWorkoutCalendarEventId(
      session.sessionId,
      event.id,
    )
    return linkedSession ? { status: "found", event } : { status: "failed" }
  } catch (error) {
    return { status: getCalendarFailureStatus(error) }
  }
}

async function resolveWorkoutCalendarEvent(
  session: StoredWorkoutSession,
  legacyMatchSession = session,
): Promise<WorkoutCalendarEventLookup> {
  try {
    if (!(await hasCalendarEventWritePermission())) {
      return { status: "permissionDenied" }
    }
  } catch {
    return { status: "failed" }
  }

  if (!session.calendarEventId) {
    return findLegacyWorkoutCalendarEvent(legacyMatchSession)
  }

  const linkedEvent = await getCalendarEventById(session.calendarEventId)
  if (linkedEvent.status !== "notFound") {
    return linkedEvent
  }

  const legacyEvent = await findLegacyWorkoutCalendarEvent(legacyMatchSession)
  return legacyEvent.status === "unlinked" ? linkedEvent : legacyEvent
}

/** 캘린더 자동 저장 선호값을 묻는 기본 Alert를 표시한다. */
function showCalendarAutoAddPreferencePrompt(
  handlers: CalendarAutoAddPromptHandlers,
) {
  Alert.alert(
    i18n.t("workout.calendar.autoAddPromptTitle"),
    i18n.t("workout.calendar.autoAddPromptBody"),
    [
      {
        text: i18n.t("workout.calendar.autoAddDecline"),
        style: "cancel",
        onPress: handlers.onDecline,
      },
      {
        text: i18n.t("workout.calendar.autoAddAccept"),
        onPress: handlers.onAccept,
      },
    ],
    { cancelable: false },
  )
}

/** 캘린더 자동 추가 선호값이 정해지지 않았으면 운동 시작 흐름에서 미리 묻는다. */
export async function promptCalendarAutoAddPreferenceIfUnknown() {
  const preference = await getCalendarAutoAddPreference()

  if (preference !== "unknown") {
    return false
  }

  const hasPermission = await hasCalendarEventWritePermission()
  return promptCalendarAutoAddPreference({
    hasPermission,
    requestPermission: requestCalendarEventWritePermission,
    setPreference: setCalendarAutoAddPreference,
    showPrompt: showCalendarAutoAddPreferencePrompt,
  })
}

/** 완료된 운동 세션을 기기 캘린더 이벤트로 등록 */
export async function registerWorkoutToCalendar(
  params: {
    sessionId: string
    startedAt: string
    completedAt: string
    cardioStartedAt?: string | null
    memo: string
    bodyParts: WorkoutBodyPartSet[]
    isDeload?: boolean
    location?: WorkoutLocation | null
  },
  options: {
    allowPermissionRequest?: boolean
    showAlerts?: boolean
  } = {},
) {
  const { allowPermissionRequest = true, showAlerts = true } = options
  let hasPermission = await hasCalendarEventWritePermission()

  if (!hasPermission && allowPermissionRequest) {
    hasPermission = await requestCalendarEventWritePermission()
  }

  if (!hasPermission) {
    return false
  }

  let calendarId: string | null = null
  try {
    calendarId = await getOrCreateYepBuddyCalendarId()
  } catch {
    calendarId = null
  }

  if (!calendarId) {
    if (showAlerts) {
      showCalendarRegistrationFailureAlert()
    }
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

  let calendarEventId: string
  try {
    calendarEventId = await Calendar.createEventAsync(calendarId, {
      title: getWorkoutCalendarTitle({
        bodyParts: params.bodyParts,
        cardioStartedAt: params.cardioStartedAt ?? null,
        completedAt: params.completedAt,
        isDeload: params.isDeload ?? false,
      }),
      startDate,
      endDate,
      notes: params.memo || undefined,
      location: eventLocation,
    })
  } catch {
    if (showAlerts) {
      showCalendarRegistrationFailureAlert()
    }
    return false
  }

  const linkedSession = await updateStoredWorkoutCalendarEventId(
    params.sessionId,
    calendarEventId,
  ).catch(() => null)
  if (!linkedSession) {
    await Calendar.deleteEventAsync(calendarEventId).catch(() => undefined)
    if (showAlerts) {
      showCalendarRegistrationFailureAlert()
    }
    return false
  }

  if (showAlerts) {
    Alert.alert(
      i18n.t("workout.calendar.successTitle"),
      i18n.t("workout.calendar.successBody"),
    )
  }
  return true
}

/** 연결된 캘린더 이벤트의 제목과 메모를 현재 세션으로 갱신 */
export async function updateWorkoutCalendarEvent(
  session: StoredWorkoutSession,
  legacyMatchSession = session,
): Promise<WorkoutCalendarUpdateStatus> {
  const lookup = await resolveWorkoutCalendarEvent(session, legacyMatchSession)
  if (lookup.status !== "found") {
    return lookup.status
  }

  const details: Omit<Partial<Calendar.Event>, "id"> = {
    title: getWorkoutCalendarTitle(session),
    alarms: lookup.event.alarms ?? [],
    allDay: lookup.event.allDay,
    availability: lookup.event.availability,
    location: lookup.event.location ?? "",
    notes: session.memo || "",
  }
  if (Platform.OS === "android") {
    details.timeZone = lookup.event.timeZone
    details.endTimeZone = lookup.event.endTimeZone
  }

  try {
    const updatedEventId = await Calendar.updateEventAsync(
      lookup.event.id,
      details,
    )
    const linkedSession = await updateStoredWorkoutCalendarEventId(
      session.sessionId,
      updatedEventId,
    )
    return linkedSession ? "updated" : "failed"
  } catch (error) {
    return getCalendarFailureStatus(error)
  }
}

/** 연결되었거나 안전하게 복구된 캘린더 이벤트를 삭제 */
export async function deleteWorkoutCalendarEvent(
  session: StoredWorkoutSession,
): Promise<WorkoutCalendarDeleteStatus> {
  const lookup = await resolveWorkoutCalendarEvent(session)
  if (lookup.status !== "found") {
    return lookup.status
  }

  try {
    await Calendar.deleteEventAsync(lookup.event.id)
    return "deleted"
  } catch (error) {
    return getCalendarFailureStatus(error)
  }
}

/** 완료 세션의 캘린더 자동 추가 정책 실행 */
export async function processCompletedWorkoutCalendarAutoAdd(
  session: StoredWorkoutSession,
  completionSource: WorkoutCompletionSource,
) {
  const preference = await getCalendarAutoAddPreference()
  const hasPermission = await hasCalendarEventWritePermission()
  const decision = getCalendarAutoAddDecision({
    completionSource,
    hasCalendarPermission: hasPermission,
    preference,
  })

  if (decision.shouldRegister) {
    return registerWorkoutToCalendar(
      {
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        cardioStartedAt: session.cardioStartedAt,
        memo: session.memo,
        bodyParts: session.bodyParts,
        isDeload: session.isDeload,
        location: session.location,
      },
      { allowPermissionRequest: false, showAlerts: false },
    )
  }

  if (!decision.shouldAskUser) {
    return false
  }

  const enabled = await promptCalendarAutoAddPreference({
    hasPermission,
    requestPermission: requestCalendarEventWritePermission,
    setPreference: setCalendarAutoAddPreference,
    showPrompt: showCalendarAutoAddPreferencePrompt,
  })

  if (!enabled) {
    return false
  }

  return registerWorkoutToCalendar(
    {
      sessionId: session.sessionId,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      cardioStartedAt: session.cardioStartedAt,
      memo: session.memo,
      bodyParts: session.bodyParts,
      isDeload: session.isDeload,
      location: session.location,
    },
    { allowPermissionRequest: false, showAlerts: false },
  )
}
