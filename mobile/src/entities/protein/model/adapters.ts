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

// DB의 상품 카테고리 코드를 화면에 표시할 라벨로 변환
const CATEGORY_LABELS: Record<ProteinCategory, string> = {
  wpc: "WPC",
  wpi: "WPI",
  wpcwpi: "WPC/WPI",
  creatine: "크레아틴",
  "beta-alanine": "베타알라닌",
}

// 상품 카테고리에 맞는 표시용 라벨을 반환
export function getProteinCategoryLabel(category: ProteinCategory) {
  return CATEGORY_LABELS[category]
}

// 가격 배지가 없을 때는 화면에서 중간 가격대로 취급
function priceLevelOf(badge?: { kind: PriceLevel } | null): PriceLevel {
  return badge?.kind ?? "mid"
}

// 상세 화면에 표시할 특징 목록을 설명 문장과 맛 정보로 구성
function toFeatureLines(protein: ApiProtein, flavors: ApiProteinFlavor[]) {
  const lines: string[] = []

  if (protein.description?.trim()) {
    // 여러 구분자를 지원해 DB에 저장된 설명을 표시 가능한 문장 단위로 나눔
    lines.push(
      ...protein.description
        .split(/[,，、ㆍ·;|\n\r]+/g)
        .map((value) => value.replace(/\s+/g, " ").trim())
        .filter(Boolean),
    )
  }

  // 맛 티어와 메모가 있으면 한 줄에 함께 노출
  for (const flavor of flavors) {
    const tier = flavor.tier ? ` (${flavor.tier})` : ""
    const note = flavor.note ? ` - ${flavor.note}` : ""
    lines.push(`맛: ${flavor.name}${tier}${note}`)
  }

  return lines.length > 0 ? lines : [`맛: ${protein.taste}`]
}

// 목록 화면에서 필요한 상품 정보와 최신 가격 정보를 하나의 모델로 합침
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

// 상세 화면에서 사용할 상품 정보, 가격 히스토리, 맛 정보를 하나의 모델로 만든다.
export function buildProteinDetail(
  protein: ApiProtein,
  priceResult: ApiProteinPriceResult,
  flavors: ApiProteinFlavor[],
): ProteinDetail {
  const latest = priceResult.items[0]
  // API는 최신순으로 내려주므로 차트 표시용으로 오래된 날짜부터 정렬한다.
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
