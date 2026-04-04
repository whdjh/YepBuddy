import { useColorScheme } from "react-native"
import { Host, VStack, HStack, Text as SwiftText } from "@expo/ui/swift-ui"
import {
  glassEffect,
  frame,
  font,
  foregroundStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers"

interface StatCardProps {
  label: string
  subtitle: string
  value: number | string
  unit: string
}

export function StatCard({ label, subtitle, value, unit }: StatCardProps) {
  const isDark = useColorScheme() === "dark"

  const fgColor = isDark ? "#FFFFFF" : "#3A2A1A"
  const fgSecondary = isDark ? "#EDE4D6" : "#876B45"
  const accentColor = isDark ? "#D4883A" : "#9B7E56"

  return (
    <Host style={{ minHeight: 120 }}>
      <VStack
        alignment="leading"
        modifiers={[
          padding({ top: 20, leading: 20, bottom: 20, trailing: 20 }),
          frame({ maxWidth: 9999, minHeight: 120, alignment: "leading" }),
          glassEffect({
            glass: { variant: "regular", interactive: true },
            shape: "roundedRectangle",
            cornerRadius: 16,
          }),
        ]}
      >
        <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
          {label}
        </SwiftText>
        <SwiftText modifiers={[font({ size: 11 }), foregroundStyle(fgColor)]}>
          {subtitle}
        </SwiftText>
        <HStack alignment="firstTextBaseline" spacing={2}>
          <SwiftText modifiers={[font({ size: 36, weight: "bold", design: "rounded" }), foregroundStyle(accentColor)]}>
            {String(value)}
          </SwiftText>
          <SwiftText modifiers={[font({ size: 14, weight: "medium" }), foregroundStyle(fgSecondary)]}>
            {` ${unit}`}
          </SwiftText>
        </HStack>
      </VStack>
    </Host>
  )
}
