import { StyleSheet, View } from "react-native"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { useUnstableNativeVariable } from "nativewind"

interface GlassBackgroundProps {
  /** 코너 라운드 (포인트) */
  cornerRadius?: number
  /** Liquid Glass 미지원 환경 폴백 className */
  fallbackClassName?: string
}

const IS_GLASS = isLiquidGlassAvailable()

export function GlassBackground({
  cornerRadius = 16,
  fallbackClassName = "bg-yb-surface-muted/80",
}: GlassBackgroundProps) {
  const tintColor =
    (useUnstableNativeVariable("--yb-glass-bg") as unknown as string) ||
    "rgba(255,255,255,0.65)"
  const fillStyle = [StyleSheet.absoluteFill, { borderRadius: cornerRadius }]

  if (IS_GLASS) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        tintColor={tintColor}
        pointerEvents="none"
        style={fillStyle}
      />
    )
  }

  return (
    <View
      className={fallbackClassName}
      pointerEvents="none"
      style={fillStyle}
    />
  )
}
