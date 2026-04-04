import { Pressable, useColorScheme } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { Host, HStack, VStack, Text as SwiftText, Gauge, Image, Spacer } from "@expo/ui/swift-ui"
import {
  glassEffect,
  frame,
  font,
  foregroundStyle,
  padding,
  gaugeStyle,
  tint,
} from "@expo/ui/swift-ui/modifiers"

interface TodayWorkoutCardProps {
  bodyParts: string
  totalSets: number
  targetSets: number
}

export function TodayWorkoutCard({ bodyParts, totalSets, targetSets }: TodayWorkoutCardProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const isDark = useColorScheme() === "dark"

  const fgColor = isDark ? "#FFFFFF" : "#3A2A1A"
  const fgSecondary = isDark ? "#EDE4D6" : "#876B45"
  const accentColor = isDark ? "#D4883A" : "#9B7E56"
  const progress = targetSets > 0 ? totalSets / targetSets : 0

  return (
    <Pressable onPress={() => router.push("/calendar")}>
      <Host style={{ minHeight: 130 }}>
        <HStack
          spacing={16}
          modifiers={[
            padding({ top: 20, leading: 20, bottom: 20, trailing: 20 }),
            frame({ maxWidth: 9999, minHeight: 130 }),
            glassEffect({
              glass: { variant: "regular", interactive: true },
              shape: "roundedRectangle",
              cornerRadius: 16,
            }),
          ]}
        >
          <Gauge
            value={progress}
            modifiers={[
              gaugeStyle("circularCapacity"),
              frame({ width: 90, height: 90 }),
              tint(accentColor),
            ]}
          >
            <SwiftText modifiers={[font({ size: 24, weight: "bold", design: "rounded" }), foregroundStyle(fgColor)]}>
              {String(totalSets)}
            </SwiftText>
          </Gauge>
          <VStack alignment="leading" spacing={4}>
            <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
              {t("summary.todayWorkout")}
            </SwiftText>
            <SwiftText modifiers={[font({ size: 22, weight: "bold" }), foregroundStyle(fgColor)]}>
              {bodyParts}
            </SwiftText>
            <SwiftText modifiers={[font({ size: 22, weight: "bold" }), foregroundStyle(accentColor)]}>
              {`${totalSets}${t("summary.setsUnit")}`}
            </SwiftText>
          </VStack>
          <Spacer />
          <Image systemName="chevron.right" size={18} color={fgSecondary} />
        </HStack>
      </Host>
    </Pressable>
  )
}
