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
  | "doc.on.doc"
  | "dumbbell.fill"
  | "figure.run"
  | "gearshape.fill"
  | "heart.fill"
  | "pause.fill"
  | "pencil"
  | "play.fill"
  | "plus"
  | "stop.fill"
  | "trash"
  | "xmark"
>

const androidNameBySymbolName = {
  "arrow.clockwise": "replay",
  checkmark: "check",
  "chevron.left": "chevron_left",
  "chevron.right": "chevron_right",
  "circle.fill": "circle",
  "doc.on.doc": "content_copy",
  "dumbbell.fill": "fitness_center",
  "figure.run": "directions_run",
  "gearshape.fill": "settings",
  "heart.fill": "favorite",
  "pause.fill": "pause",
  pencil: "edit",
  "play.fill": "play_arrow",
  plus: "add",
  "stop.fill": "stop",
  trash: "delete",
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
