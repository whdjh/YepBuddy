import type { RoutineCycleSetupPromptKind } from "@/entities/workout-session"

type Translate = (key: string) => string

export interface RoutineCyclePromptAlertButton {
  /** Alert 버튼에 표시할 문구 */
  text: string
  /** React Native Alert 버튼 스타일 */
  style?: "default" | "cancel" | "destructive"
  /** 버튼 선택 시 실행할 동작 */
  onPress: () => void
}

interface RoutineCyclePromptAlertConfigInput {
  /** 표시할 루틴 사이클 안내 종류 */
  kind: RoutineCycleSetupPromptKind
  /** i18n 번역 함수 */
  t: Translate
  /** 루틴을 조정하며 새 사이클을 시작할 때 실행 */
  onChangeRoutine: () => void
  /** 기존 루틴 그대로 새 사이클을 시작할 때 실행 */
  onKeepRoutine: () => void
  /** 안내를 나중으로 미룰 때 실행 */
  onDismiss: () => void
}

export interface RoutineCyclePromptAlertConfig {
  /** Alert 제목 */
  title: string
  /** Alert 본문 */
  message: string
  /** Alert 버튼 목록 */
  buttons: RoutineCyclePromptAlertButton[]
}

/** 루틴 사이클 종료 Alert에 표시할 문구와 버튼 */
export function buildRoutineCyclePromptAlertConfig({
  kind,
  t,
  onChangeRoutine,
  onKeepRoutine,
  onDismiss,
}: RoutineCyclePromptAlertConfigInput): RoutineCyclePromptAlertConfig {
  return {
    title: t(`workout.routineCycle.prompt.${kind}.title`),
    message: t(`workout.routineCycle.prompt.${kind}.body`),
    buttons: [
      {
        text: t("workout.routineCycle.prompt.dismiss"),
        style: "cancel",
        onPress: onDismiss,
      },
      {
        text: t(`workout.routineCycle.prompt.${kind}.keepRoutine`),
        onPress: onKeepRoutine,
      },
      {
        text: t(`workout.routineCycle.prompt.${kind}.changeRoutine`),
        onPress: onChangeRoutine,
      },
    ],
  }
}
