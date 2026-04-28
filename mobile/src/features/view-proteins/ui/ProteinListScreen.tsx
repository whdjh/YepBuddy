import { useEffect, useMemo, useState } from "react"
import { ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { Main } from "@/shared/ui/Main"
import { FilterPill } from "@/shared/ui/Chip"
import {
  fetchLatestProteinPrices,
  fetchProteins,
  getProteinCategoryLabel,
  mergeProteinListItems,
  ProteinCard,
} from "@/entities/protein"
import type { Protein, ProteinCategory } from "@/entities/protein"

const CATEGORIES: (ProteinCategory | "all")[] = ["all", "wpc", "wpi", "wpcwpi", "creatine", "beta-alanine"]

export function ProteinListScreen() {
  const router = useRouter()

  const { t } = useTranslation()

  const [activeFilter, setActiveFilter] = useState<ProteinCategory | "all">("all")
  const [proteins, setProteins] = useState<Protein[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProteins() {
      setLoading(true)
      setError(null)

      try {
        const [proteinItems, priceItems] = await Promise.all([
          fetchProteins(),
          fetchLatestProteinPrices(),
        ])

        if (!cancelled) {
          setProteins(mergeProteinListItems(proteinItems, priceItems))
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load proteins")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProteins()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredProteins = useMemo(() => {
    if (activeFilter === "all") return proteins
    return proteins.filter((p) => p.category === activeFilter)
  }, [activeFilter, proteins])

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
              label={cat === "all" ? t("protein.filterAll") : getProteinCategoryLabel(cat)}
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
        {loading && (
          <Text className="text-yb-fg-secondary text-yb-body py-yb-4">
            불러오는 중...
          </Text>
        )}
        {error && (
          <Text className="text-yb-fg-secondary text-yb-body py-yb-4">
            {error}
          </Text>
        )}
        {!loading && !error && filteredProteins.length === 0 && (
          <Text className="text-yb-fg-secondary text-yb-body py-yb-4">
            표시할 프로틴이 없습니다
          </Text>
        )}
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
