import { StyleSheet, View } from "react-native"
import { GlassView } from "expo-glass-effect"
import { useUnstableNativeVariable } from "nativewind"
import { useGlassEffectState } from "./GlassBackground"

export function GlassCircleBackground() {
  const glassTintColor =
    (useUnstableNativeVariable("--yb-glass-bg") as unknown as string) || undefined
  const { glassEffectEnabled } = useGlassEffectState()

  if (glassEffectEnabled) {
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
      className="absolute inset-0 bg-yb-surface/95"
      pointerEvents="none"
    />
  )
}
