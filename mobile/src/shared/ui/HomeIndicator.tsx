import { View, type ViewProps } from "react-native"

interface HomeIndicatorProps extends ViewProps {}

export function HomeIndicator({ className, ...rest }: HomeIndicatorProps) {
  return (
    <View
      className={`w-[134px] h-[5px] rounded-[3px] self-center mt-yb-2 bg-yb-fg opacity-15${className ? ` ${className}` : ""}`}
      {...rest}
    />
  )
}
