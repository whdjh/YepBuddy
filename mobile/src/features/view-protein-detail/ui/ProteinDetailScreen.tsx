import { Linking, ScrollView, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "react-native-css-interop"
import { SymbolView } from "expo-symbols"
import { Badge } from "@/shared/ui/Badge"
import { Button } from "@/shared/ui/Button"
import { IconButton } from "@/shared/ui/IconButton"
import { Card } from "@/shared/ui/Card"
import { PriceTrendChart } from "@/entities/protein"
import type { ProteinDetail } from "@/entities/protein"

const MOCK_DETAILS: Record<string, ProteinDetail> = {
  p1: {
    id: "p1", name: "옵티멈 골드 스탠다드 웨이", category: "WPC",
    volume: 2268, price: 116690, pricePerGram: 51.5, priceLevel: "mid",
    flavor: "더블 리치 초콜릿",
    features: ["인지도가 가장 높은 프로틴", "맛과 용해도가 우수함", "가격대가 다소 높은 편"],
    purchaseUrl: "https://www.coupang.com",
    priceHistory: [
      { date: "2025-10", price: 125000 },
      { date: "2025-11", price: 121000 },
      { date: "2025-12", price: 119500 },
      { date: "2026-01", price: 118000 },
      { date: "2026-02", price: 117200 },
      { date: "2026-03", price: 116690 },
    ],
  },
  p2: {
    id: "p2", name: "마이프로틴 임팩트 웨이", category: "WPC",
    volume: 2500, price: 52900, pricePerGram: 21.2, priceLevel: "low",
    flavor: "내추럴 초콜릿",
    features: ["가성비가 매우 좋음", "다양한 맛 선택 가능", "용해도가 좋은 편"],
    purchaseUrl: "https://www.myprotein.co.kr",
    priceHistory: [
      { date: "2025-10", price: 59900 },
      { date: "2025-11", price: 55000 },
      { date: "2025-12", price: 54500 },
      { date: "2026-01", price: 53200 },
      { date: "2026-02", price: 52900 },
      { date: "2026-03", price: 52900 },
    ],
  },
  p3: {
    id: "p3", name: "BSN 신타-6 프로틴", category: "Blend",
    volume: 2270, price: 71500, pricePerGram: 31.5, priceLevel: "mid",
    flavor: "초콜릿 밀크쉐이크",
    features: ["블렌드 프로틴의 대표 제품", "맛이 매우 좋음", "단백질 함량 대비 가격이 높은 편"],
    purchaseUrl: "https://www.coupang.com",
    priceHistory: [
      { date: "2025-10", price: 78000 },
      { date: "2025-11", price: 75500 },
      { date: "2025-12", price: 73000 },
      { date: "2026-01", price: 72000 },
      { date: "2026-02", price: 71500 },
      { date: "2026-03", price: 71500 },
    ],
  },
  p4: {
    id: "p4", name: "머슬팜 컴뱃 100% 웨이", category: "WPC",
    volume: 2269, price: 62000, pricePerGram: 27.3, priceLevel: "mid",
    flavor: "초콜릿 밀크",
    features: ["균형 잡힌 성분 구성", "적당한 가격대", "맛이 무난한 편"],
    purchaseUrl: "https://www.coupang.com",
    priceHistory: [
      { date: "2025-10", price: 68000 },
      { date: "2025-11", price: 65000 },
      { date: "2025-12", price: 63500 },
      { date: "2026-01", price: 62500 },
      { date: "2026-02", price: 62000 },
      { date: "2026-03", price: 62000 },
    ],
  },
  p5: {
    id: "p5", name: "다이마타이즈 ISO100", category: "WPI",
    volume: 2300, price: 89000, pricePerGram: 38.7, priceLevel: "high",
    flavor: "고메 초콜릿",
    features: ["WPI 분리유청 순도 높음", "소화 흡수가 빠름", "가격대가 높은 편"],
    purchaseUrl: "https://www.coupang.com",
    priceHistory: [
      { date: "2025-10", price: 95000 },
      { date: "2025-11", price: 92000 },
      { date: "2025-12", price: 90000 },
      { date: "2026-01", price: 89500 },
      { date: "2026-02", price: 89000 },
      { date: "2026-03", price: 89000 },
    ],
  },
  p6: {
    id: "p6", name: "룰원 R1 프로틴", category: "WPI",
    volume: 2270, price: 82000, pricePerGram: 36.1, priceLevel: "mid",
    flavor: "바닐라 크림",
    features: ["WPI 기반으로 순도 높음", "깔끔한 맛", "중간 가격대"],
    purchaseUrl: null,
    priceHistory: [
      { date: "2025-10", price: 85000 },
      { date: "2025-11", price: 84000 },
      { date: "2025-12", price: 83000 },
      { date: "2026-01", price: 82500 },
      { date: "2026-02", price: 82000 },
      { date: "2026-03", price: 82000 },
    ],
  },
}

export function ProteinDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const router = useRouter()

  const insets = useSafeAreaInsets()

  const { t } = useTranslation()
  
  const fgColor = (useUnstableNativeVariable("--yb-fg") as unknown as string) || "#3A2A1A"

  const protein = MOCK_DETAILS[id]!

  return (
    <View className="h-full w-full bg-yb-bg" style={{ paddingTop: insets.top }}>
      {/* 헤더 */}
      <View className="px-yb-5 pb-yb-4">
        <View className="flex-row items-center gap-yb-3 py-yb-2">
          <IconButton variant="back-square" onPress={() => router.back()}>
            <SymbolView name="chevron.left" size={20} tintColor={fgColor} />
          </IconButton>
          <View className="shrink">
            <View className="flex-row items-center gap-yb-1">
              <Text className="text-yb-fg text-yb-body-lg font-semibold shrink" numberOfLines={1}>
                {protein.name}
              </Text>
              <Badge
                level={protein.priceLevel}
                label={t(`protein.levels.${protein.priceLevel}`)}
              />
            </View>
            <Text className="text-yb-fg-secondary text-yb-caption">
              {t("protein.detail.subtitle", { volume: protein.volume.toLocaleString(), category: protein.category, flavor: protein.flavor })}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-yb-5 gap-yb-4 pb-yb-6"
      >
        {/* 현재가 */}
        <Card variant="glass" cornerRadius={20} paddingSize={20}>
          <Card.Header label={t("protein.detail.currentPrice")} />
          <Card.Spacer size={12} />
          <Card.Row alignment="bottom">
            <Card.Metric
              value={protein.price.toLocaleString()}
              unit={t("protein.detail.priceUnit")}
              valueSize={32}
              unitSize={16}
            />
            <Card.Spacer />
            <Card.Caption>{t("protein.detail.pricePerGram", { value: protein.pricePerGram })}</Card.Caption>
          </Card.Row>
        </Card>

        {/* 특징 */}
        <Card variant="glass" cornerRadius={20} paddingSize={20}>
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

      {/* 구매 버튼 */}
      <View
        className="px-yb-5 pt-yb-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Button
          variant="glass"
          label={t("protein.detail.buyNow")}
          disabled={protein.purchaseUrl === null}
          onPress={() => {
            if (protein.purchaseUrl) {
              Linking.openURL(protein.purchaseUrl)
            }
          }}
        />
      </View>
    </View>
  )
}
