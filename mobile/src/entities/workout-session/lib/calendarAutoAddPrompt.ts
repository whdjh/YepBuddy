import type { CalendarAutoAddPreference } from "./calendarAutoAdd"

export interface CalendarAutoAddPromptHandlers {
  onAccept: () => void
  onDecline: () => void
}

interface CalendarAutoAddPreferencePromptParams {
  hasPermission: boolean
  requestPermission: () => Promise<boolean>
  setPreference: (preference: CalendarAutoAddPreference) => Promise<void>
  showPrompt: (handlers: CalendarAutoAddPromptHandlers) => void
}

/** 캘린더 자동 저장 Alert 응답을 선호값 확정으로 변환 */
export async function promptCalendarAutoAddPreference(
  params: CalendarAutoAddPreferencePromptParams,
) {
  return new Promise<boolean>((resolve) => {
    params.showPrompt({
      onDecline: () => {
        void params.setPreference("disabled").finally(() => {
          resolve(false)
        })
      },
      onAccept: () => {
        void (async () => {
          const granted =
            params.hasPermission || (await params.requestPermission())

          if (!granted) {
            await params.setPreference("disabled")
            resolve(false)
            return
          }

          await params.setPreference("enabled")
          resolve(true)
        })().catch(() => {
          resolve(false)
        })
      },
    })
  })
}
