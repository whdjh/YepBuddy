import { Pressable } from "react-native"
import { useTranslation } from "react-i18next"
import { Text as SwiftText } from "@expo/ui/swift-ui"
import {
  background,
  clipShape,
  font,
  foregroundStyle,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { statusColorTokens } from "@/shared/lib/designTokens"
import { Card } from "@/shared/ui/Card"
import type { PriceLevel, Protein } from "../model/types"

const BADGE_STATUS_BY_LEVEL: Record<
  PriceLevel,
  keyof typeof statusColorTokens
> = {
  low: "success",
  mid: "info",
  high: "error",
} as const

function useBadgeColors(level: PriceLevel) {
  const token = statusColorTokens[BADGE_STATUS_BY_LEVEL[level]]
  return {
    bg: useResolvedColorToken({
      variable: token.bg,
      fallback: token.fallbackBg,
    }),
    fg: useResolvedColorToken({
      variable: token.fg,
      fallback: token.fallbackFg,
    }),
  }
}

interface ProteinCardProps {
  protein: Protein
  onPress?: () => void
}

export function ProteinCard({ protein, onPress }: ProteinCardProps) {
  const { t } = useTranslation()
  const { accent, fg, fgSecondary } = useCardColors()
  const badgeColors = useBadgeColors(protein.priceLevel)

  const price =
    protein.price != null ? `${protein.price.toLocaleString()}원` : "-"
  const pricePerGram =
    protein.pricePerGram != null
      ? `${protein.pricePerGram.toLocaleString()}원`
      : "-"

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
              background(
                badgeColors.bg,
                shapes.roundedRectangle({ cornerRadius: 8 }),
              ),
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
              <SwiftText
                modifiers={[
                  font({ size: 12, weight: "medium" }),
                  foregroundStyle(fgSecondary),
                ]}
              >
                {t("protein.volume")}
              </SwiftText>
              <SwiftText
                modifiers={[
                  font({ size: 15, weight: "bold" }),
                  foregroundStyle(fg),
                ]}
              >
                {`${protein.volume.toLocaleString()}g · ${protein.categoryLabel} · ${protein.flavor}`}
              </SwiftText>
            </Card.Row>
            <Card.Row spacing={4} alignment="firstTextBaseline">
              <SwiftText
                modifiers={[
                  font({ size: 12, weight: "medium" }),
                  foregroundStyle(fgSecondary),
                ]}
              >
                {t("protein.price")}
              </SwiftText>
              <SwiftText
                modifiers={[
                  font({ size: 15, weight: "bold" }),
                  foregroundStyle(fg),
                ]}
              >
                {price}
              </SwiftText>
            </Card.Row>
          </Card.Column>

          <Card.Spacer />

          <Card.Column alignment="trailing" spacing={2}>
            <SwiftText
              modifiers={[
                font({ size: 12, weight: "medium" }),
                foregroundStyle(fgSecondary),
              ]}
            >
              {t("protein.pricePerGram")}
            </SwiftText>
            <SwiftText
              modifiers={[
                font({ size: 15, weight: "bold" }),
                foregroundStyle(accent),
              ]}
            >
              {pricePerGram}
            </SwiftText>
          </Card.Column>
        </Card.Row>
      </Card>
    </Pressable>
  )
}
