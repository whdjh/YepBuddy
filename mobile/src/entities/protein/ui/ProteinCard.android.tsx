import { Pressable, StyleSheet, Text } from "react-native"
import { useTranslation } from "react-i18next"
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
          <Text
            style={[
              styles.badge,
              {
                backgroundColor: badgeColors.bg,
                color: badgeColors.fg,
              },
            ]}
          >
            {t(`protein.levels.${protein.priceLevel}`)}
          </Text>
        </Card.Row>

        <Card.Spacer size={14} />

        <Card.Row spacing={0} alignment="bottom">
          <Card.Column alignment="leading" spacing={6}>
            <Card.Row spacing={4} alignment="firstTextBaseline">
              <Text style={[styles.label, { color: fgSecondary }]}>
                {t("protein.volume")}
              </Text>
              <Text style={[styles.value, { color: fg }]}>
                {`${protein.volume.toLocaleString()}g · ${protein.categoryLabel} · ${protein.flavor}`}
              </Text>
            </Card.Row>
            <Card.Row spacing={4} alignment="firstTextBaseline">
              <Text style={[styles.label, { color: fgSecondary }]}>
                {t("protein.price")}
              </Text>
              <Text style={[styles.value, { color: fg }]}>{price}</Text>
            </Card.Row>
          </Card.Column>

          <Card.Spacer />

          <Card.Column alignment="trailing" spacing={2}>
            <Text style={[styles.label, { color: fgSecondary }]}>
              {t("protein.pricePerGram")}
            </Text>
            <Text style={[styles.value, { color: accent }]}>
              {pricePerGram}
            </Text>
          </Card.Column>
        </Card.Row>
      </Card>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "700",
    includeFontPadding: false,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    includeFontPadding: false,
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    includeFontPadding: false,
  },
})
