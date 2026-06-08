import { getUtcMsFromDateKey } from "@/shared/lib/date"
import type { MonthWorkoutDates } from "./types"

const MS_PER_DAY = 24 * 60 * 60 * 1000
// 루틴 사이클의 앵커 날짜부터 달력에 디로드 라벨을 표시할 기본 기간
const DAYS_PER_CYCLE_LABEL_RANGE = 7

interface BuildCurrentCycleDeloadDateLabelsInput {
  // 현재 루틴 사이클을 달력에 표시할 때 기준이 되는 시작 날짜 키
  currentCycleAnchorDateKey: string
  // 현재 사이클이 디로드 회차일 때만 라벨 날짜를 생성
  isDeloadCycle: boolean
}

// UTC 기준 timestamp를 YYYY-MM-DD dateKey로 변환
function getDateKeyFromUtcMs(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10)
}

// 현재 디로드 사이클의 앵커 날짜부터 7일간 달력 라벨용 날짜 맵
export function buildCurrentCycleDeloadDateLabels({
  currentCycleAnchorDateKey,
  isDeloadCycle,
}: BuildCurrentCycleDeloadDateLabelsInput): Record<string, true> {
  if (!isDeloadCycle) {
    return {}
  }

  const startMs = getUtcMsFromDateKey(currentCycleAnchorDateKey)
  if (startMs === null) {
    return {}
  }

  return Array.from({ length: DAYS_PER_CYCLE_LABEL_RANGE }).reduce<Record<string, true>>(
    (accumulator, _, index) => {
      accumulator[getDateKeyFromUtcMs(startMs + index * MS_PER_DAY)] = true
      return accumulator
    },
    {},
  )
}

// 기존 운동 날짜 데이터에 디로드 라벨을 병합하고, 운동이 없는 날짜도 라벨 표시용 항목으로 채움
export function mergeWorkoutDatesWithDeloadLabels(
  workoutDates: MonthWorkoutDates["workoutDates"],
  deloadDateLabels: Record<string, true>,
): MonthWorkoutDates["workoutDates"] {
  return Object.keys(deloadDateLabels).reduce<MonthWorkoutDates["workoutDates"]>(
    (accumulator, dateKey) => {
      const workout = accumulator[dateKey]

      accumulator[dateKey] = workout
        ? { ...workout, isDeload: true }
        : {
            bodyParts: [],
            hasCardio: false,
            isDeload: true,
            sessionId: null,
          }

      return accumulator
    },
    { ...workoutDates },
  )
}
