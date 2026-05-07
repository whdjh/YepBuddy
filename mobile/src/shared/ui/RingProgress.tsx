import { View, type ViewProps } from "react-native"
import { useUnstableNativeVariable } from "nativewind"
import Svg, { Circle } from "react-native-svg"

interface RingProgressProps extends Omit<ViewProps, "children"> {
  size: number
  strokeWidth?: number
  progress: number
  trackColor?: string
  fillColor?: string
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
  style,
  ...rest
}: RingProgressProps) {
  const tokenTrackColor =
    (useUnstableNativeVariable("--yb-ring-track") as unknown as string) || "#EDE4D6"
  const tokenFillColor =
    (useUnstableNativeVariable("--yb-ring-fill") as unknown as string) || "#9B7E56"
  const safeSize = Number.isFinite(size) ? Math.max(0, size) : 0
  const safeStrokeWidth = Number.isFinite(strokeWidth)
    ? Math.min(Math.max(0, strokeWidth), safeSize)
    : 0
  const radius = (safeSize - safeStrokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const safeProgress = Number.isFinite(progress) ? progress : 0
  const clampedProgress = Math.min(Math.max(safeProgress, 0), 1)
  const strokeDashoffset = circumference * (1 - clampedProgress)
  const resolvedTrackColor = trackColor ?? tokenTrackColor
  const resolvedFillColor = fillColor ?? tokenFillColor

  return (
    <View
      className={`items-center justify-center${className ? ` ${className}` : ""}`}
      style={[style, { width: safeSize, height: safeSize }]}
      {...rest}
    >
      <Svg width={safeSize} height={safeSize} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          fill="none"
          stroke={resolvedTrackColor}
          strokeWidth={safeStrokeWidth}
        />
        <Circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          fill="none"
          stroke={resolvedFillColor}
          strokeWidth={safeStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {children != null && (
        <View className="absolute items-center justify-center">
          {children}
        </View>
      )}
    </View>
  )
}
