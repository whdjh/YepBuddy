import { View } from "react-native"
import { Host, GlassEffectContainer, VStack, Spacer } from "@expo/ui/swift-ui"
import { frame, glassEffect } from "@expo/ui/swift-ui/modifiers"
import { isLiquidGlassAvailable } from "expo-glass-effect"

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
  if (IS_GLASS) {
    return (
      <View className="absolute inset-0" pointerEvents="none">
        <Host style={{ flex: 1 }}>
          <GlassEffectContainer>
            <VStack
              modifiers={[
                frame({ maxWidth: 9999, maxHeight: 9999 }),
                glassEffect({
                  glass: { variant: "regular", interactive: true },
                  shape: "roundedRectangle",
                  cornerRadius,
                }),
              ]}
            >
              <Spacer />
            </VStack>
          </GlassEffectContainer>
        </Host>
      </View>
    )
  }

  return <View className={`absolute inset-0 ${fallbackClassName}`} />
}
