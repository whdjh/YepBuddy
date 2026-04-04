import { useColorScheme } from "react-native"
import { useTranslation } from "react-i18next"
import { Host, HStack, VStack, Text as SwiftText, Image, Spacer, Divider } from "@expo/ui/swift-ui"
import {
  glassEffect,
  frame,
  font,
  foregroundStyle,
  padding,
  background,
  clipShape,
  shapes,
} from "@expo/ui/swift-ui/modifiers"

interface SessionData {
  bodyPart: string
  day: string
  durationMin: number
  sets: number
  kcal: number
}

interface WeeklySessionListProps {
  sessions: SessionData[]
  onMorePress?: () => void
}

export function WeeklySessionList({ sessions, onMorePress }: WeeklySessionListProps) {
  const { t } = useTranslation()
  const isDark = useColorScheme() === "dark"

  const fgColor = isDark ? "#FFFFFF" : "#3A2A1A"
  const fgSecondary = isDark ? "#EDE4D6" : "#876B45"
  const accentColor = isDark ? "#D4883A" : "#9B7E56"
  const fillPale = isDark ? "#5A472D" : "#F2EBDD"

  const estimatedHeight = 40 + 32 + sessions.length * 68

  return (
    <Host matchContents={{ vertical: true }} ignoreSafeArea="all" style={{ minHeight: estimatedHeight }}>
      <VStack
        spacing={0}
        modifiers={[
          padding({ top: 20, leading: 20, bottom: 20, trailing: 20 }),
          frame({ maxWidth: 9999 }),
          glassEffect({
            glass: { variant: "regular", interactive: true },
            shape: "roundedRectangle",
            cornerRadius: 16,
          }),
        ]}
      >
        {/* 헤더 */}
        <HStack>
          <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
            {t("summary.thisWeekSessions")}
          </SwiftText>
          <Spacer />
          <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
            {t("summary.moreLink")}
          </SwiftText>
          <Image systemName="chevron.right" size={12} color={accentColor} onPress={onMorePress} />
        </HStack>
        <Spacer minLength={12} />

        {/* 세션 목록 */}
        {sessions.map((session, index) => (
          <VStack key={`${session.bodyPart}-${session.day}`} spacing={0}>
            {index > 0 && <Divider />}
            <HStack
              spacing={12}
              modifiers={[
                padding({ top: 10, bottom: 10 }),
                frame({ minHeight: 48 }),
              ]}
            >
              <Image
                systemName="dumbbell.fill"
                size={18}
                color={accentColor}
                modifiers={[
                  frame({ width: 40, height: 44 }),
                  background(fillPale, shapes.roundedRectangle({ cornerRadius: 8 })),
                  clipShape("roundedRectangle", 8),
                ]}
              />
              <VStack alignment="leading" spacing={2}>
                <SwiftText modifiers={[font({ size: 15, weight: "semibold" }), foregroundStyle(fgColor)]}>
                  {session.bodyPart}
                </SwiftText>
                <HStack spacing={4}>
                  <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
                    {session.day}
                  </SwiftText>
                  <Image systemName="circle.fill" size={4} color={accentColor} />
                  <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
                    {`${session.durationMin}${t("summary.minuteUnit")}`}
                  </SwiftText>
                  <Image systemName="circle.fill" size={4} color={accentColor} />
                  <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
                    {`${session.sets}${t("summary.setsUnit")}`}
                  </SwiftText>
                </HStack>
              </VStack>
              <Spacer />
              <VStack alignment="trailing">
                <SwiftText modifiers={[font({ size: 15, weight: "bold" }), foregroundStyle(accentColor)]}>
                  {String(session.kcal)}
                </SwiftText>
                <SwiftText modifiers={[font({ size: 11 }), foregroundStyle(fgSecondary)]}>
                  {t("summary.kcalUnit")}
                </SwiftText>
              </VStack>
            </HStack>
          </VStack>
        ))}
      </VStack>
    </Host>
  )
}
