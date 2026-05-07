import { View, type ViewProps } from "react-native"

type HomeIndicatorProps = ViewProps

export function HomeIndicator({ className, ...rest }: HomeIndicatorProps) {
  return (
    <View
      className={`w-[134px] h-[5px] rounded-yb-xs self-center mt-yb-2 bg-yb-fg opacity-15${className ? ` ${className}` : ""}`}
      {...rest}
    />
  )
}
