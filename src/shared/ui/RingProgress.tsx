import { View, type ViewProps } from "react-native"
import Svg, { Circle } from "react-native-svg"

interface RingProgressProps extends Omit<ViewProps, "children"> {
  size: number
  strokeWidth?: number
  progress: number
  trackColor: string
  fillColor: string
  children?: React.ReactNode
}

export function RingProgress({
  size,
  strokeWidth = 4,
  progress,
  trackColor,
  fillColor,
  children,
  className,
  ...rest
}: RingProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const strokeDashoffset = circumference * (1 - clampedProgress)

  return (
    <View
      className={`items-center justify-center${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {children && (
        <View className="absolute items-center justify-center">
          {children}
        </View>
      )}
    </View>
  )
}
