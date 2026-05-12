import { useEffect, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTranslation } from "react-i18next"
import { SymbolView } from "expo-symbols"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { Badge } from "@/shared/ui/Badge"
import { Button } from "@/shared/ui/Button"
import { IconButton } from "@/shared/ui/IconButton"
import { Card } from "@/shared/ui/Card"
import {
  buildProteinDetail,
  fetchProtein,
  fetchProteinFlavors,
  fetchProteinPrices,
  CoupangPartnersDisclosure,
  PriceTrendChart,
} from "@/entities/protein"
import type { ProteinDetail } from "@/entities/protein"

export function ProteinDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>()

  const router = useRouter()

  const insets = useSafeAreaInsets()

  const { t } = useTranslation()

  const { fg: fgColor } = useCardColors()
  const [protein, setProtein] = useState<ProteinDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const routeProteinId = Array.isArray(params.id) ? params.id[0] : params.id
  const proteinId =
    typeof routeProteinId === "string" && routeProteinId.length > 0
      ? routeProteinId
      : null

  useEffect(() => {
    if (!proteinId) {
      setProtein(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    const selectedProteinId = proteinId

    async function loadProtein() {
      setLoading(true)
      setError(null)
      setProtein(null)

      try {
        const [proteinData, priceData, flavors] = await Promise.all([
          fetchProtein(selectedProteinId),
          fetchProteinPrices(selectedProteinId),
          fetchProteinFlavors(selectedProteinId),
        ])

        if (!cancelled) {
          setProtein(proteinData ? buildProteinDetail(proteinData, priceData, flavors) : null)
        }
      } catch {
        if (!cancelled) {
          setError(t("protein.detail.loadError"))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProtein()

    return () => {
      cancelled = true
    }
  }, [proteinId, t])

  const price = protein?.price != null ? protein.price.toLocaleString() : "-"
  const pricePerGram = protein?.pricePerGram != null ? protein.pricePerGram.toLocaleString() : null
  const statusMessage = loading
    ? t("protein.loading")
    : error ?? t("protein.detail.notFound")
  const pricePerGramLabel = pricePerGram
    ? t("protein.detail.pricePerGram", { value: pricePerGram })
    : "-"

  return (
    <View className="h-full w-full bg-yb-bg" style={{ paddingTop: insets.top }}>
      {/* 헤더 */}
      <View className="px-yb-5 pb-yb-4">
        <View className="flex-row items-center gap-yb-3 py-yb-2">
          <IconButton
            accessibilityLabel={t("common.back")}
            variant="back-square"
            onPress={() => router.back()}
          >
            <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
          </IconButton>
          <View className="shrink">
            <View className="flex-row items-center gap-yb-1">
              <Text className="text-yb-fg text-yb-body-lg font-semibold shrink" numberOfLines={1}>
                {protein?.name ?? t("protein.detail.title")}
              </Text>
              {protein && (
                <Badge
                  level={protein.priceLevel}
                  label={t(`protein.levels.${protein.priceLevel}`)}
                />
              )}
            </View>
            {protein && (
              <Text className="text-yb-fg-secondary text-yb-caption">
                {t("protein.detail.subtitle", {
                  volume: protein.volume.toLocaleString(),
                  category: protein.categoryLabel,
                  flavor: protein.flavor,
                })}
              </Text>
            )}
          </View>
        </View>
      </View>

      {(loading || error || !protein) && (
        <View className="px-yb-5 pt-yb-4">
          <Text className="text-yb-fg-secondary text-yb-body">
            {statusMessage}
          </Text>
        </View>
      )}

      {protein && (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-yb-5 gap-yb-4 pb-yb-6"
      >
        <CoupangPartnersDisclosure />

        {/* 현재가 */}
        <Card variant="glass">
          <Card.Header label={t("protein.detail.currentPrice")} />
          <Card.Spacer size={12} />
          <Card.Row alignment="bottom">
            <Card.Metric
              value={price}
              unit={t("protein.detail.priceUnit")}
              valueSize={32}
              unitSize={16}
            />
            <Card.Spacer />
            <Card.Caption>{pricePerGramLabel}</Card.Caption>
          </Card.Row>
        </Card>

        {/* 특징 */}
        <Card variant="glass">
          <Card.Column alignment="leading" spacing={8}>
            <Card.Header label={t("protein.detail.features")} />
            {protein.features.map((feature, index) => (
              <Card.Label key={index}>{`• ${feature}`}</Card.Label>
            ))}
          </Card.Column>
        </Card>

        {/* 가격 추이 */}
        <View>
          <Text className="text-yb-fg-secondary text-yb-caption font-medium mb-yb-3">
            {t("protein.detail.priceTrend")}
          </Text>
          <PriceTrendChart data={protein.priceHistory} />
        </View>
      </ScrollView>
      )}

      {/* 구매 버튼 */}
      <View
        className="px-yb-5 pt-yb-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          variant="glass"
          label={t("protein.detail.buyNow")}
          disabled
        />
      </View>
    </View>
  )
}
