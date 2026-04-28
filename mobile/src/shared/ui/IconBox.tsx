import { View, type ViewProps } from "react-native"

type IconBoxSize = "sm" | "md" | "lg" | "xl"

interface IconBoxProps extends ViewProps {
  size?: IconBoxSize
}

const sizeStyles: Record<IconBoxSize, string> = {
  sm: "w-[44px] h-[44px] rounded-yb-icon",
  md: "w-[48px] h-[48px] rounded-yb-icon",
  lg: "w-[56px] h-[56px] rounded-yb-icon",
  xl: "w-[80px] h-[80px] rounded-full",
}

export function IconBox({ size = "md", className, children, ...rest }: IconBoxProps) {
  return (
    <View
      className={`items-center justify-center shrink-0 ${sizeStyles[size]}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </View>
  )
}
