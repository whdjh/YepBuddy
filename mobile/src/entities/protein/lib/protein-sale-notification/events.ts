export interface ProteinSaleEvent {
  id: string
  titleKey: string
  saleStartMonth: number
  saleStartDay: number
  saleEndMonth?: number
  saleEndDay?: number
}

export interface ProteinSaleNotificationPlan {
  eventId: string
  year: number
  titleKey: string
  notificationDate: Date
}

const FIXED_EVENTS: ProteinSaleEvent[] = [
  {
    id: "new-year",
    titleKey: "protein.saleNotifications.events.newYear",
    saleStartMonth: 1,
    saleStartDay: 1,
  },
  {
    id: "double-day-0202",
    titleKey: "protein.saleNotifications.events.doubleDay0202",
    saleStartMonth: 2,
    saleStartDay: 2,
  },
  {
    id: "double-day-0303",
    titleKey: "protein.saleNotifications.events.doubleDay0303",
    saleStartMonth: 3,
    saleStartDay: 3,
  },
  {
    id: "double-day-0404",
    titleKey: "protein.saleNotifications.events.doubleDay0404",
    saleStartMonth: 4,
    saleStartDay: 4,
  },
  {
    id: "golden-week",
    titleKey: "protein.saleNotifications.events.goldenWeek",
    saleStartMonth: 5,
    saleStartDay: 3,
    saleEndMonth: 5,
    saleEndDay: 5,
  },
  {
    id: "double-day-0606",
    titleKey: "protein.saleNotifications.events.doubleDay0606",
    saleStartMonth: 6,
    saleStartDay: 6,
  },
  {
    id: "double-day-0707",
    titleKey: "protein.saleNotifications.events.doubleDay0707",
    saleStartMonth: 7,
    saleStartDay: 7,
  },
  {
    id: "double-day-0808",
    titleKey: "protein.saleNotifications.events.doubleDay0808",
    saleStartMonth: 8,
    saleStartDay: 8,
  },
  {
    id: "double-day-0909",
    titleKey: "protein.saleNotifications.events.doubleDay0909",
    saleStartMonth: 9,
    saleStartDay: 9,
  },
  {
    id: "double-day-1010",
    titleKey: "protein.saleNotifications.events.doubleDay1010",
    saleStartMonth: 10,
    saleStartDay: 10,
  },
  {
    id: "singles-day",
    titleKey: "protein.saleNotifications.events.singlesDay",
    saleStartMonth: 11,
    saleStartDay: 11,
  },
  {
    id: "year-end",
    titleKey: "protein.saleNotifications.events.yearEnd",
    saleStartMonth: 12,
    saleStartDay: 12,
  },
]

// 세일 시작일 전날 19:00 계산 — JS Date의 day=0 언더플로우로 월 경계 자동 처리
export function getSaleReminderDate(
  year: number,
  saleStartMonth: number,
  saleStartDay: number,
): Date {
  return new Date(year, saleStartMonth - 1, saleStartDay - 1, 19, 0, 0, 0)
}

// 해당 연도 11월 마지막 금요일 계산
export function getBlackFridayDate(year: number): Date {
  const date = new Date(year, 10, 30, 0, 0, 0, 0)

  while (date.getDay() !== 5) {
    date.setDate(date.getDate() - 1)
  }

  return date
}

// getSaleReminderDate에 금요일 날짜를 넘기면 day-1이 적용되어 목요일 19:00 반환
function getBlackFridayReminderDate(year: number): Date {
  const blackFriday = getBlackFridayDate(year)
  return getSaleReminderDate(
    blackFriday.getFullYear(),
    blackFriday.getMonth() + 1,
    blackFriday.getDate(),
  )
}

// 현재·다음 연도 기준 아직 오지 않은 세일 알림 계획 목록 생성
export function buildProteinSaleNotificationPlans(
  now = new Date(),
): ProteinSaleNotificationPlan[] {
  const years = [now.getFullYear(), now.getFullYear() + 1]
  const plans: ProteinSaleNotificationPlan[] = []

  for (const year of years) {
    for (const event of FIXED_EVENTS) {
      plans.push({
        eventId: event.id,
        year,
        titleKey: event.titleKey,
        notificationDate: getSaleReminderDate(
          year,
          event.saleStartMonth,
          event.saleStartDay,
        ),
      })
    }

    plans.push({
      eventId: "black-friday",
      year,
      titleKey: "protein.saleNotifications.events.blackFriday",
      notificationDate: getBlackFridayReminderDate(year),
    })
  }

  return plans
    .filter((plan) => plan.notificationDate.getTime() > now.getTime())
    .sort((a, b) => a.notificationDate.getTime() - b.notificationDate.getTime())
}
