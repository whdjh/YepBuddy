import type {
  ApiProtein,
  ApiProteinFlavor,
  ApiProteinPrice,
  ApiProteinPriceResult,
  PriceLevel,
  Protein,
  ProteinCategory,
  ProteinDetail,
  PriceHistoryPoint,
} from "./types"

const CATEGORY_LABELS: Record<ProteinCategory, string> = {
  wpc: "WPC",
  wpi: "WPI",
  wpcwpi: "WPC/WPI",
  creatine: "크레아틴",
  "beta-alanine": "베타알라닌",
}

export function getProteinCategoryLabel(category: ProteinCategory) {
  return CATEGORY_LABELS[category]
}

function priceLevelOf(badge?: { kind: PriceLevel } | null): PriceLevel {
  return badge?.kind ?? "mid"
}

function toFeatureLines(protein: ApiProtein, flavors: ApiProteinFlavor[]) {
  const lines: string[] = []

  if (protein.description?.trim()) {
    lines.push(
      ...protein.description
        .split(/[,，、ㆍ·;|\n\r]+/g)
        .map((value) => value.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    )
  }

  for (const flavor of flavors) {
    const tier = flavor.tier ? ` (${flavor.tier})` : ""
    const note = flavor.note ? ` - ${flavor.note}` : ""
    lines.push(`맛: ${flavor.name}${tier}${note}`)
  }

  return lines.length > 0 ? lines : [`맛: ${protein.taste}`]
}

export function mergeProteinListItems(proteins: ApiProtein[], prices: ApiProteinPrice[]): Protein[] {
  const priceMap = new Map(prices.map((price) => [price.protein_id, price]))

  return proteins.map((protein) => {
    const latest = priceMap.get(protein.protein_id)

    return {
      id: String(protein.protein_id),
      name: protein.title,
      category: protein.topic,
      categoryLabel: getProteinCategoryLabel(protein.topic),
      flavor: protein.taste,
      volume: protein.weight,
      price: latest?.price ?? null,
      pricePerGram: latest?.per_protein_gram ?? null,
      priceLevel: priceLevelOf(latest?.badge),
      purchaseUrl: latest?.url ?? protein.url ?? null,
    }
  })
}

export function buildProteinDetail(
  protein: ApiProtein,
  priceResult: ApiProteinPriceResult,
  flavors: ApiProteinFlavor[],
): ProteinDetail {
  const latest = priceResult.items[0]
  const priceHistory: PriceHistoryPoint[] = [...priceResult.items]
    .reverse()
    .map((price) => ({ date: price.observed_date, price: price.price }))

  return {
    id: String(protein.protein_id),
    name: protein.title,
    category: protein.topic,
    categoryLabel: getProteinCategoryLabel(protein.topic),
    flavor: protein.taste,
    volume: protein.weight,
    price: latest?.price ?? null,
    pricePerGram: latest?.per_protein_gram ?? null,
    priceLevel: priceLevelOf(priceResult.badge),
    purchaseUrl: latest?.url ?? protein.url ?? null,
    features: toFeatureLines(protein, flavors),
    priceHistory,
  }
}
