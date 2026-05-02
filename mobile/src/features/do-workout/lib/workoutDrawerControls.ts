type WorkoutDrawerTimerIconName = "stop.fill" | "arrow.clockwise"

interface WorkoutDrawerTimerControl {
  iconName: WorkoutDrawerTimerIconName
  labelKey: string
}

// 타이머 옆 원형 버튼은 기록 중에는 운동 중지, 중지 상태에서는 재개로 동작
export function getWorkoutDrawerTimerControl(
  isPaused: boolean,
): WorkoutDrawerTimerControl {
  return isPaused
    ? { iconName: "arrow.clockwise", labelKey: "workout.active.resume" }
    : { iconName: "stop.fill", labelKey: "workout.active.stopWorkout" }
}

// 펼쳐진 드로어의 보조 버튼도 원형 버튼과 같은 중지/재개 문구를 사용
export function getWorkoutDrawerExpandedToggleLabelKey(isPaused: boolean) {
  return isPaused ? "workout.active.resume" : "workout.active.stopWorkout"
}

// 운동 종료 버튼은 기록 중/중지 상태와 관계없이 항상 활성화
export function canEndWorkoutFromDrawer(_isPaused: boolean) {
  return true
}
