import { View, type ViewProps } from "react-native"

type IconBoxSize = "sm" | "md" | "lg" | "xl"

interface IconBoxProps extends ViewProps {
  size?: IconBoxSize
}

const sizeStyles: Record<IconBoxSize, string> = {
  sm: "h-yb-icon-sm w-yb-icon-sm rounded-yb-icon",
  md: "h-yb-icon-md w-yb-icon-md rounded-yb-icon",
  lg: "h-yb-icon-lg w-yb-icon-lg rounded-yb-icon",
  xl: "h-yb-icon-box-xl w-yb-icon-box-xl rounded-full",
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
