export interface CalendarDateParts {
  year: number
  month: number
  day: number
}

export function getDateParts(date = new Date()): CalendarDateParts {
  const targetDate = date

  return {
    year: targetDate.getFullYear(),
    month: targetDate.getMonth() + 1,
    day: targetDate.getDate(),
  }
}
