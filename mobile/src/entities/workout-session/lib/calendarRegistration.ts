export const YEPBUDDY_CALENDAR_TITLE = "YepBuddy"
export const YEPBUDDY_CALENDAR_NAME = "yepbuddy"
export const YEPBUDDY_CALENDAR_COLOR = "#9B7E56"

interface CalendarCandidate {
  id: string
  title?: string | null
  name?: string | null
  allowsModifications?: boolean
}

// 이미 만들어진 YepBuddy 전용 캘린더 중 수정 가능한 캘린더 ID를 찾음
export function findYepBuddyCalendarId(
  calendars: CalendarCandidate[],
): string | null {
  const calendar = calendars.find(
    (item) =>
      item.allowsModifications &&
      (item.title === YEPBUDDY_CALENDAR_TITLE ||
        item.name === YEPBUDDY_CALENDAR_NAME),
  )

  return calendar?.id ?? null
}
