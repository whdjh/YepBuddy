import { Pressable, useColorScheme } from "react-native"
import { useRouter } from "expo-router"
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

interface WorkoutLinkCardProps {
  disabled?: boolean
}

export function WorkoutLinkCard({ disabled = false }: WorkoutLinkCardProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const isDark = useColorScheme() === "dark"

  const fgColor = isDark ? "#FFFFFF" : "#3A2A1A"
  const fgSecondary = isDark ? "#EDE4D6" : "#876B45"
  const accentColor = isDark ? "#D4883A" : "#9B7E56"
  const fillPale = isDark ? "#5A472D" : "#F2EBDD"

  return (
    <Pressable
      onPress={() => !disabled && router.push("/workout/countdown")}
      disabled={disabled}
      className={disabled ? "opacity-40" : ""}
    >
      <Host style={{ minHeight: 200 }}>
        <VStack
          spacing={0}
          modifiers={[
            padding({ top: 20, leading: 20, bottom: 20, trailing: 20 }),
            frame({ maxWidth: 9999, minHeight: 200 }),
            glassEffect({
              glass: { variant: "regular", interactive: true },
              shape: "roundedRectangle",
              cornerRadius: 16,
            }),
          ]}
        >
          <HStack>
            <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
              {t("summary.workout")}
            </SwiftText>
            <Spacer />
          </HStack>
          <Spacer minLength={12} />
          <Image
            systemName="play.fill"
            size={28}
            color={accentColor}
            modifiers={[
              frame({ width: 56, height: 56 }),
              background(fillPale, shapes.roundedRectangle({ cornerRadius: 16 })),
              clipShape("roundedRectangle", 16),
            ]}
          />
          <Spacer minLength={10} />
          <SwiftText modifiers={[font({ size: 15, weight: "bold" }), foregroundStyle(fgColor)]}>
            {t("summary.strengthTraining")}
          </SwiftText>
          <Spacer minLength={10} />
          <HStack spacing={4}>
            <Image systemName="circle.fill" size={8} color={accentColor} />
            <SwiftText modifiers={[font({ size: 15, weight: "semibold" }), foregroundStyle(accentColor)]}>
              {t("summary.startWorkout")}
            </SwiftText>
          </HStack>
        </VStack>
      </Host>
    </Pressable>
  )
}
