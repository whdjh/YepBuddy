import { useMemo, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { Main } from "@/shared/ui/Main"
import { FilterPill } from "@/shared/ui/Chip"
import { ProteinCard } from "@/entities/protein"
import type { Protein, ProteinCategory } from "@/entities/protein"

const CATEGORIES: Array<ProteinCategory | "all"> = ["all", "WPC", "WPI", "Blend"]

const MOCK_PROTEINS: Protein[] = [
  { id: "p1", name: "옵티멈 골드 스탠다드 웨이", category: "WPC", volume: 2268, price: 116690, pricePerGram: 51.5, priceLevel: "mid" },
  { id: "p2", name: "마이프로틴 임팩트 웨이", category: "WPC", volume: 2500, price: 52900, pricePerGram: 21.2, priceLevel: "low" },
  { id: "p3", name: "BSN 신타-6 프로틴", category: "Blend", volume: 2270, price: 71500, pricePerGram: 31.5, priceLevel: "mid" },
  { id: "p4", name: "머슬팜 컴뱃 100% 웨이", category: "WPC", volume: 2269, price: 62000, pricePerGram: 27.3, priceLevel: "mid" },
  { id: "p5", name: "다이마타이즈 ISO100", category: "WPI", volume: 2300, price: 89000, pricePerGram: 38.7, priceLevel: "high" },
  { id: "p6", name: "룰원 R1 프로틴", category: "WPI", volume: 2270, price: 82000, pricePerGram: 36.1, priceLevel: "mid" },
]

export function ProteinListScreen() {
  const router = useRouter()

  const { t } = useTranslation()

  const [activeFilter, setActiveFilter] = useState<ProteinCategory | "all">("all")

  const filteredProteins = useMemo(() => {
    if (activeFilter === "all") return MOCK_PROTEINS
    return MOCK_PROTEINS.filter((p) => p.category === activeFilter)
  }, [activeFilter])

  return (
    <Main>
      <View className="px-yb-5 pt-yb-4">
        <Text className="text-yb-fg text-yb-display font-bold">
          {t("protein.title")}
        </Text>
      </View>

      <View className="pt-yb-4 pb-yb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-yb-5 gap-yb-2"
        >
          {CATEGORIES.map((cat) => (
            <FilterPill
              key={cat}
              label={cat === "all" ? t("protein.filterAll") : cat}
              variant={activeFilter === cat ? "active" : "default"}
              onPress={() => setActiveFilter(cat)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerClassName="px-yb-5 pt-yb-2 pb-yb-30"
        showsVerticalScrollIndicator={false}
      >
        {filteredProteins.map((protein) => (
          <ProteinCard
            key={protein.id}
            protein={protein}
            onPress={() => router.push(`/protein/${protein.id}`)}
          />
        ))}
      </ScrollView>
    </Main>
  )
}
