import { useReducer } from "react"
import { ScrollView, Text } from "react-native"
import { useTranslation } from "react-i18next"
import { Main } from "@/shared/ui/Main"
import { Button } from "@/shared/ui/Button"
import { tempoReducer, initialTempoState } from "../model/tempoReducer"
import { TempoModeButtons } from "./TempoModeButtons"
import { TempoRingDisplay } from "./TempoRingDisplay"
import { TempoSettings } from "./TempoSettings"

export function TempoScreen() {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(tempoReducer, initialTempoState)

  return (
    <Main>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-yb-5 pt-yb-4 pb-yb-30"
      >
        <Text className="text-yb-fg text-yb-display font-bold mb-yb-4">
          {t("tempo.title")}
        </Text>

        <TempoModeButtons
          modeIndex={state.modeIndex}
          onChangeMode={(v) => dispatch({ type: "SET_MODE", payload: v })}
        />

        <TempoRingDisplay
          status="idle"
          progress={0}
          currentSet={0}
          currentRep={0}
          sets={state.sets}
        />

        <TempoSettings state={state} dispatch={dispatch} />

        <Button
          variant="accent"
          label={t("tempo.start")}
          onPress={() => {}}
        />
      </ScrollView>
    </Main>
  )
}
