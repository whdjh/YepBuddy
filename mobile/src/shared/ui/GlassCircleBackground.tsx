import { StyleSheet, View } from "react-native"
import { GlassView } from "expo-glass-effect"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { useGlassEffectState } from "./GlassBackground"

export function GlassCircleBackground() {
  const glassTintColor = useResolvedColorToken(semanticColorTokens.glassBg)
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
