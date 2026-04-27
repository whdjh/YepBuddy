import { View } from "react-native"
import { useTranslation } from "react-i18next"
import { Stepper } from "@/shared/ui/Stepper"
import type { TempoState, TempoAction } from "../model/tempoReducer"

interface TempoSettingsProps {
  state: TempoState
  dispatch: React.Dispatch<TempoAction>
}

export function TempoSettings({ state, dispatch }: TempoSettingsProps) {
  const { t } = useTranslation()

  return (
    <>
      <View className="flex-row gap-yb-3 mb-yb-3">
        <View className="grow">
          <Stepper
            label={t("tempo.contraction")}
            value={state.contraction}
            unit={t("tempo.secondUnit")}
            min={1}
            onDecrement={() =>
              dispatch({ type: "SET_CONTRACTION", payload: state.contraction - 1 })
            }
            onIncrement={() =>
              dispatch({ type: "SET_CONTRACTION", payload: state.contraction + 1 })
            }
          />
        </View>
        <View className="grow">
          <Stepper
            label={t("tempo.relaxation")}
            value={state.relaxation}
            unit={t("tempo.secondUnit")}
            min={1}
            onDecrement={() =>
              dispatch({ type: "SET_RELAXATION", payload: state.relaxation - 1 })
            }
            onIncrement={() =>
              dispatch({ type: "SET_RELAXATION", payload: state.relaxation + 1 })
            }
          />
        </View>
      </View>
      <View className="flex-row gap-yb-3 mb-yb-3">
        <View className="grow">
          <Stepper
            label={t("tempo.reps")}
            value={state.reps}
            unit={t("tempo.repsUnit")}
            min={1}
            onDecrement={() =>
              dispatch({ type: "SET_REPS", payload: state.reps - 1 })
            }
            onIncrement={() =>
              dispatch({ type: "SET_REPS", payload: state.reps + 1 })
            }
          />
        </View>
        <View className="grow">
          <Stepper
            label={t("tempo.setsUnit")}
            value={state.sets}
            unit={t("tempo.setsUnit")}
            min={1}
            onDecrement={() =>
              dispatch({ type: "SET_SETS", payload: state.sets - 1 })
            }
            onIncrement={() =>
              dispatch({ type: "SET_SETS", payload: state.sets + 1 })
            }
          />
        </View>
      </View>

      <Stepper
        label={t("tempo.rest")}
        value={state.rest}
        unit={t("tempo.secondUnit")}
        min={0}
        jumpStep={10}
        onJumpDown={() =>
          dispatch({ type: "SET_REST", payload: state.rest - 10 })
        }
        onDecrement={() =>
          dispatch({ type: "SET_REST", payload: state.rest - 1 })
        }
        onIncrement={() =>
          dispatch({ type: "SET_REST", payload: state.rest + 1 })
        }
        onJumpUp={() =>
          dispatch({ type: "SET_REST", payload: state.rest + 10 })
        }
        className="mb-yb-4"
      />
    </>
  )
}
