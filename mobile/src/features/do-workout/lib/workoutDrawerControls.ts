type WorkoutDrawerTimerIconName = "pause.fill" | "play.fill"

interface WorkoutDrawerTimerControl {
  iconName: WorkoutDrawerTimerIconName
  labelKey: string
  tone: "neutral"
}

// 타이머 옆 원형 버튼은 기록 중에는 일시정지, 일시정지 상태에서는 재개로 동작
export function getWorkoutDrawerTimerControl(
  isPaused: boolean,
): WorkoutDrawerTimerControl {
  return isPaused
    ? {
        iconName: "play.fill",
        labelKey: "workout.active.resume",
        tone: "neutral",
      }
    : {
        iconName: "pause.fill",
        labelKey: "workout.active.pause",
        tone: "neutral",
      }
}

// 펼쳐진 드로어의 보조 버튼도 원형 버튼과 같은 일시정지/재개 문구를 사용
export function getWorkoutDrawerExpandedToggleLabelKey(isPaused: boolean) {
  return isPaused ? "workout.active.resume" : "workout.active.pause"
}

// 운동 종료 버튼은 기록 중/일시정지 상태와 관계없이 항상 활성화
export function canEndWorkoutFromDrawer(_isPaused: boolean) {
  return true
}
