import { Pressable, useColorScheme } from "react-native"
import { useTranslation } from "react-i18next"
import { Host, HStack, VStack, Text as SwiftText, Image, Spacer } from "@expo/ui/swift-ui"
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

interface SessionLinkCardProps {
  bodyPart: string
  kcal: number
  day: string
}

export function SessionLinkCard({ bodyPart, kcal, day }: SessionLinkCardProps) {
  const { t } = useTranslation()
  const isDark = useColorScheme() === "dark"

  const fgColor = isDark ? "#FFFFFF" : "#3A2A1A"
  const fgSecondary = isDark ? "#EDE4D6" : "#876B45"
  const accentColor = isDark ? "#D4883A" : "#9B7E56"
  const fillPale = isDark ? "#5A472D" : "#F2EBDD"

  return (
    <Pressable onPress={() => {}}>
      <Host style={{ minHeight: 200 }}>
        <VStack
          alignment="leading"
          spacing={0}
          modifiers={[
            padding({ top: 20, leading: 20, bottom: 20, trailing: 20 }),
            frame({ maxWidth: 9999, minHeight: 200, alignment: "leading" }),
            glassEffect({
              glass: { variant: "regular", interactive: true },
              shape: "roundedRectangle",
              cornerRadius: 16,
            }),
          ]}
        >
          <HStack>
            <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
              {t("summary.session")}
            </SwiftText>
            <Spacer />
            <Image systemName="chevron.right" size={14} color={fgSecondary} />
          </HStack>
          <Spacer minLength={12} />
          <Image
            systemName="dumbbell.fill"
            size={22}
            color={accentColor}
            modifiers={[
              frame({ width: 44, height: 44 }),
              background(fillPale, shapes.roundedRectangle({ cornerRadius: 10 })),
              clipShape("roundedRectangle", 10),
            ]}
          />
          <Spacer minLength={10} />
          <SwiftText modifiers={[font({ size: 15, weight: "bold" }), foregroundStyle(fgColor)]}>
            {bodyPart}
          </SwiftText>
          <SwiftText modifiers={[font({ size: 18, weight: "bold" }), foregroundStyle(accentColor)]}>
            {`${kcal}${t("summary.kcalUnit")}`}
          </SwiftText>
          <Spacer minLength={8} />
          <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
            {day}
          </SwiftText>
        </VStack>
      </Host>
    </Pressable>
  )
}
