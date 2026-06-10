export type CalendarAutoAddPreference = "unknown" | "enabled" | "disabled"
export type WorkoutCompletionSource = "foreground" | "background"

interface CalendarAutoAddDecisionParams {
  completionSource: WorkoutCompletionSource
  hasCalendarPermission: boolean
  preference: CalendarAutoAddPreference
}

interface CalendarAutoAddDecision {
  shouldAskUser: boolean
  shouldRegister: boolean
  shouldRequestPermission: boolean
}

/** 캘린더 자동 저장 실행 정책 */
export function getCalendarAutoAddDecision(
  params: CalendarAutoAddDecisionParams,
): CalendarAutoAddDecision {
  if (params.preference === "disabled") {
    return {
      shouldAskUser: false,
      shouldRegister: false,
      shouldRequestPermission: false,
    }
  }

  if (params.preference === "unknown") {
    return {
      shouldAskUser: params.completionSource === "foreground",
      shouldRegister: false,
      shouldRequestPermission: false,
    }
  }

  return {
    shouldAskUser: false,
    shouldRegister: params.hasCalendarPermission,
    shouldRequestPermission: false,
  }
}
