import { useEffect, useRef } from "react"
import { Alert } from "react-native"
import { router } from "expo-router"
import { useTranslation } from "react-i18next"
import type { RoutineCyclePlanResult } from "@/entities/workout-session"
import { buildRoutineCyclePromptAlertConfig } from "../model/routineCyclePromptAlert"

interface RoutineCycleSetupPromptAlertProps {
  /** 루틴 사이클 상태와 Alert 액션을 제공하는 plan */
  plan: RoutineCyclePlanResult
  /** true이면 현재 루틴 사이클 안내 Alert를 표시 */
  visible: boolean
}

/** 루틴 사이클 종료 시 새 사이클 시작 방식을 선택하는 Alert */
export function RoutineCycleSetupPromptAlert({
  plan,
  visible,
}: RoutineCycleSetupPromptAlertProps) {
  const { t } = useTranslation()
  const shownPromptKeyRef = useRef<string | null>(null)
  const kind = plan.setupPromptKind

  useEffect(() => {
    if (!visible || !kind) {
      shownPromptKeyRef.current = null
      return
    }

    // 같은 안내가 리렌더마다 반복 표시되지 않도록 앵커 날짜별로 한 번만 띄움
    const promptKey = `${kind}:${plan.currentCycleAnchorDateKey}`
    if (shownPromptKeyRef.current === promptKey) {
      return
    }

    shownPromptKeyRef.current = promptKey
    const config = buildRoutineCyclePromptAlertConfig({
      kind,
      t,
      onChangeRoutine: () => {
        void plan.restartCurrentCycle().then(() => {
          router.push("/settings?routineSetup=1")
        })
      },
      onKeepRoutine: () => {
        void plan.restartCurrentCycle()
      },
      onDismiss: () => {
        void plan.dismissSetupPrompt()
      },
    })

    Alert.alert(config.title, config.message, config.buttons, {
      cancelable: true,
      onDismiss: () => {
        void plan.dismissSetupPrompt()
      },
    })
  }, [kind, plan, t, visible])

  return null
}
