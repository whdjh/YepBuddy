import AsyncStorage from "@react-native-async-storage/async-storage"
import type { WeeklyRoutineSettings } from "./weeklyRoutine"

const KEY = "yb:workout:weekly-routine"

// 주간 루틴 설정을 AsyncStorage에 저장
export async function saveWeeklyRoutineSettings(
  settings: WeeklyRoutineSettings,
): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings))
}

// 저장된 주간 루틴 설정을 불러옴. 없으면 null 반환
export async function loadWeeklyRoutineSettings(): Promise<WeeklyRoutineSettings | null> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as WeeklyRoutineSettings) : null
}
