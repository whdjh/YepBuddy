import { useReducer } from "react"
import { ScrollView, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { SymbolView } from "@/shared/ui/SymbolView"
import { Main } from "@/shared/ui/Main"
import { Button } from "@/shared/ui/Button"
import { IconButton } from "@/shared/ui/IconButton"
import { tempoReducer, initialTempoState } from "../model/tempoReducer"
import { useTempoTimer } from "../lib/useTempoTimer"
import { TempoModeButtons } from "./TempoModeButtons"
import { TempoRingDisplay } from "./TempoRingDisplay"
import { TempoSettings } from "./TempoSettings"

interface TempoScreenProps {
  showBackButton?: boolean
  onBackPress?: () => void
}

export function TempoScreen({
  showBackButton = false,
  onBackPress,
}: TempoScreenProps) {
  const { t } = useTranslation()
  const { fg: fgColor } = useCardColors()
  const [state, dispatch] = useReducer(tempoReducer, initialTempoState)
  const timer = useTempoTimer(state)

  return (
    <Main>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-yb-5 pt-yb-4 pb-yb-30"
      >
        {showBackButton && onBackPress ? (
          <View className="flex-row items-center mb-yb-4 gap-yb-3">
            <IconButton
              accessibilityLabel={t("common.back")}
              variant="back-square"
              onPress={onBackPress}
            >
              <SymbolView
                name="chevron.left"
                size={20}
                tintColor={fgColor}
              />
            </IconButton>
            <Text className="text-yb-fg text-yb-display font-bold">
              {t("tempo.title")}
            </Text>
          </View>
        ) : (
          <Text className="text-yb-fg text-yb-display font-bold mb-yb-4">
            {t("tempo.title")}
          </Text>
        )}

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
