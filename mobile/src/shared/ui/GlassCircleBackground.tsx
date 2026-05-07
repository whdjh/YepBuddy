import { StyleSheet, View } from "react-native"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { useUnstableNativeVariable } from "nativewind"

const IS_LIQUID_GLASS_AVAILABLE = isLiquidGlassAvailable()

export function GlassCircleBackground() {
  const glassTintColor =
    (useUnstableNativeVariable("--yb-glass-bg") as unknown as string) || undefined

  if (IS_LIQUID_GLASS_AVAILABLE) {
    return (
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        tintColor={glassTintColor}
        className="absolute inset-0"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
    )
  }

  return (
    <View
      className="absolute inset-0 bg-yb-glass-bg"
      pointerEvents="none"
    />
  )
}
