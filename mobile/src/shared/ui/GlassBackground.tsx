import { useEffect, useState } from "react"
import { AccessibilityInfo, StyleSheet, View } from "react-native"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { useUnstableNativeVariable } from "nativewind"

interface GlassBackgroundProps {
  /** 코너 라운드 (포인트) */
  cornerRadius?: number
  /** Liquid Glass 미지원 환경 폴백 className */
  fallbackClassName?: string
}

const IS_GLASS = isLiquidGlassAvailable()

function useReduceTransparencyEnabled() {
  const [reduceTransparencyEnabled, setReduceTransparencyEnabled] =
    useState(false)

  useEffect(() => {
    let mounted = true

    void AccessibilityInfo.isReduceTransparencyEnabled()
      .then((enabled) => {
        if (mounted) {
          setReduceTransparencyEnabled(enabled)
        }
      })
      .catch(() => undefined)

    const subscription = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduceTransparencyEnabled,
    )

    return () => {
      mounted = false
      subscription.remove()
    }
  }, [])

  return reduceTransparencyEnabled
}

export function useGlassEffectState() {
  const reduceTransparencyEnabled = useReduceTransparencyEnabled()

  return {
    glassEffectEnabled: IS_GLASS && !reduceTransparencyEnabled,
    reduceTransparencyEnabled,
  }
}

export function GlassBackground({
  cornerRadius = 16,
  fallbackClassName = "bg-yb-surface/95",
}: GlassBackgroundProps) {
  const tintColor =
    (useUnstableNativeVariable("--yb-glass-bg") as unknown as string) || undefined
  const fillStyle = [StyleSheet.absoluteFill, { borderRadius: cornerRadius }]
  const { glassEffectEnabled, reduceTransparencyEnabled } = useGlassEffectState()
  const resolvedFallbackClassName = reduceTransparencyEnabled
    ? "bg-yb-surface/95"
    : fallbackClassName

  if (glassEffectEnabled) {
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
      className={resolvedFallbackClassName}
      pointerEvents="none"
      style={fillStyle}
    />
  )
}
