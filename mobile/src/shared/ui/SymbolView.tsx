import {
  SymbolView as ExpoSymbolView,
  type AndroidSymbol,
  type SFSymbol,
  type SymbolViewProps as ExpoSymbolViewProps,
} from "expo-symbols"

export type SymbolViewName = Extract<
  SFSymbol,
  | "arrow.clockwise"
  | "checkmark"
  | "chevron.left"
  | "chevron.right"
  | "circle.fill"
  | "dumbbell.fill"
  | "figure.run"
  | "gearshape.fill"
  | "heart.fill"
  | "play.fill"
  | "plus"
  | "stop.fill"
  | "xmark"
>

const androidNameBySymbolName = {
  "arrow.clockwise": "replay",
  checkmark: "check",
  "chevron.left": "chevron_left",
  "chevron.right": "chevron_right",
  "circle.fill": "circle",
  "dumbbell.fill": "fitness_center",
  "figure.run": "directions_run",
  "gearshape.fill": "settings",
  "heart.fill": "favorite",
  "play.fill": "play_arrow",
  plus: "add",
  "stop.fill": "stop",
  xmark: "close",
} satisfies Record<SymbolViewName, AndroidSymbol>

interface SymbolViewProps extends Omit<ExpoSymbolViewProps, "name"> {
  name: SymbolViewName
}

export function SymbolView({
  name,
  size = 24,
  ...props
}: SymbolViewProps) {
  return (
    <ExpoSymbolView
      name={{
        ios: name,
        android: androidNameBySymbolName[name],
      }}
      size={size}
      {...props}
    />
  )
}
