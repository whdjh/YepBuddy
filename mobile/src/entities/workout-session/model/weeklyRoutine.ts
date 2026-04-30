import type { BodyPart, BodyPartDetail } from "./types"

// 루틴 세션 내 단일 운동 부위 항목
export interface RoutinePart {
  part: BodyPart
  details?: BodyPartDetail[]
}

// 하나의 루틴 세션
export interface WeeklyRoutineSession {
  id: string
  parts: RoutinePart[]
}

// 사용자가 저장한 주간 루틴 전체 설정
export interface WeeklyRoutineSettings {
  sessions: WeeklyRoutineSession[]
}

// 사용자 설정 없을 때 사용하는 기본 주간 루틴
export const DEFAULT_WEEKLY_ROUTINE_SESSIONS: WeeklyRoutineSession[] = [
  { id: "chest", parts: [{ part: "chest" }] },
  { id: "back", parts: [{ part: "back" }] },
  { id: "legs", parts: [{ part: "legs" }] },
  {
    id: "arms-shoulders",
    parts: [{ part: "arms" }, { part: "shoulders" }],
  },
]
