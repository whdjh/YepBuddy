import { useReducer } from "react"
import { ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { Main } from "@/shared/ui/Main"
import { Button } from "@/shared/ui/Button"
import { tempoReducer, initialTempoState } from "../model/tempoReducer"
import { useTempoTimer } from "../lib/useTempoTimer"
import { TempoModeButtons } from "./TempoModeButtons"
import { TempoRingDisplay } from "./TempoRingDisplay"
import { TempoSettings } from "./TempoSettings"

export function TempoScreen() {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(tempoReducer, initialTempoState)
  const timer = useTempoTimer(state)

  return (
    <Main>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-yb-5 pt-yb-4 pb-yb-30"
      >
        <Text className="text-yb-fg text-yb-display font-bold mb-yb-4">
          {t("tempo.title")}
        </Text>

        <View
          pointerEvents={timer.isRunning ? "none" : "auto"}
          className={timer.isRunning ? "opacity-40" : ""}
        >
          <TempoModeButtons
            modeIndex={state.modeIndex}
            onChangeMode={(v) => dispatch({ type: "SET_MODE", payload: v })}
          />
        </View>

        <TempoRingDisplay
          status={timer.isRunning ? timer.status : "idle"}
          progress={timer.progress}
          currentSet={timer.currentSet}
          currentRep={timer.currentRep}
          sets={state.sets}
          countdownRemaining={timer.countdownRemaining}
        />

        <View
          pointerEvents={timer.isRunning ? "none" : "auto"}
          className={timer.isRunning ? "opacity-40" : ""}
        >
          <TempoSettings state={state} dispatch={dispatch} />
        </View>

        {!timer.isRunning && (
          <Button
            variant="accent"
            label={t("tempo.start")}
            onPress={timer.start}
          />
        )}
      </ScrollView>
    </Main>
  )
}
