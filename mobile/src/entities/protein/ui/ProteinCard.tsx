import { Pressable, useColorScheme } from "react-native"
import { useTranslation } from "react-i18next"
import { Text as SwiftText } from "@expo/ui/swift-ui"
import { font, foregroundStyle, background, padding, clipShape, shapes } from "@expo/ui/swift-ui/modifiers"
import { Card } from "@/shared/ui/Card"
import type { PriceLevel, Protein } from "../model/types"

const BADGE_COLORS = {
  light: {
    low:  { bg: "#D6FAD6", fg: "#17501D" },
    mid:  { bg: "#DBF1FF", fg: "#1D456B" },
    high: { bg: "#FFE2DE", fg: "#722423" },
  },
  dark: {
    low:  { bg: "rgba(67,194,81,0.18)", fg: "#43C251" },
    mid:  { bg: "rgba(96,170,243,0.18)", fg: "#60AAF3" },
    high: { bg: "rgba(232,88,84,0.18)", fg: "#E85854" },
  },
} as const

function useBadgeColors(level: PriceLevel) {
  const isDark = useColorScheme() === "dark"
  return BADGE_COLORS[isDark ? "dark" : "light"][level]
}

interface ProteinCardProps {
  protein: Protein
  onPress?: () => void
}

export function ProteinCard({ protein, onPress }: ProteinCardProps) {
  const { t } = useTranslation()

  const isDark = useColorScheme() === "dark"
  
  const badgeColors = useBadgeColors(protein.priceLevel)

  const fg = isDark ? "#FFFFFF" : "#3A2A1A"
  const fgSecondary = isDark ? "#EDE4D6" : "#876B45"
  const accent = isDark ? "#D4883A" : "#9B7E56"
  const price = protein.price != null ? `${protein.price.toLocaleString()}원` : "-"
  const pricePerGram = protein.pricePerGram != null ? `${protein.pricePerGram.toLocaleString()}원` : "-"

  return (
    <Pressable onPress={onPress} className="mb-yb-3">
      <Card variant="glass">
        <Card.Row spacing={8} alignment="center">
          <Card.Title size={16}>{protein.name}</Card.Title>
          <Card.Spacer />
          <SwiftText
            modifiers={[
              font({ size: 12, weight: "bold" }),
              foregroundStyle(badgeColors.fg),
              padding({ top: 4, bottom: 4, leading: 10, trailing: 10 }),
              background(badgeColors.bg, shapes.roundedRectangle({ cornerRadius: 8 })),
              clipShape("roundedRectangle", 8),
            ]}
          >
            {t(`protein.levels.${protein.priceLevel}`)}
          </SwiftText>
        </Card.Row>

        <Card.Spacer size={14} />

        <Card.Row spacing={0} alignment="bottom">
          <Card.Column alignment="leading" spacing={6}>
            <Card.Row spacing={4} alignment="firstTextBaseline">
              <SwiftText modifiers={[font({ size: 12, weight: "medium" }), foregroundStyle(fgSecondary)]}>
                {t("protein.volume")}
              </SwiftText>
              <SwiftText modifiers={[font({ size: 15, weight: "bold" }), foregroundStyle(fg)]}>
                {`${protein.volume.toLocaleString()}g · ${protein.categoryLabel} · ${protein.flavor}`}
              </SwiftText>
            </Card.Row>
            <Card.Row spacing={4} alignment="firstTextBaseline">
              <SwiftText modifiers={[font({ size: 12, weight: "medium" }), foregroundStyle(fgSecondary)]}>
                {t("protein.price")}
              </SwiftText>
              <SwiftText modifiers={[font({ size: 15, weight: "bold" }), foregroundStyle(fg)]}>
                {price}
              </SwiftText>
            </Card.Row>
          </Card.Column>

          <Card.Spacer />

          <Card.Column alignment="trailing" spacing={2}>
            <SwiftText modifiers={[font({ size: 12, weight: "medium" }), foregroundStyle(fgSecondary)]}>
              {t("protein.pricePerGram")}
            </SwiftText>
            <SwiftText modifiers={[font({ size: 15, weight: "bold" }), foregroundStyle(accent)]}>
              {pricePerGram}
            </SwiftText>
          </Card.Column>
        </Card.Row>
      </Card>
    </Pressable>
  )
}
