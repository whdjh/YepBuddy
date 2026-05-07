import { getSafeWebUrl } from "@/shared/lib/url"
import { getSupabaseClient } from "./supabaseClient"
import { decideBadge } from "../model/badge"
import type { PriceStats } from "../model/badge"
import type {
  ApiProtein,
  ApiProteinFlavor,
  ApiProteinPrice,
  ApiProteinPriceResult,
  ProteinCategory,
} from "../model/types"

type ApiRow = Record<string, unknown>

/** Supabase RPC 응답을 key 접근 가능한 row 배열로 제한 */
function toApiRows(value: unknown): ApiRow[] {
  return Array.isArray(value)
    ? value.filter(
        (row): row is ApiRow =>
          row !== null && typeof row === "object" && !Array.isArray(row),
      )
    : []
}

/** route/query string으로 들어온 상품 id를 DB primary key 숫자로 정규화 */
function parseProteinId(id: string): number | null {
  const parsed = Number(id)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

/** DB 문자열 필드를 화면에 쓸 수 있는 비어 있지 않은 문자열로 정리 */
function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed || null
}

/** Supabase numeric/decimal/string 값을 계산 가능한 숫자로 정규화 */
function toFiniteNumber(value: unknown): number | null {
  if (value == null || value === "") return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** DB row id처럼 양의 정수여야 하는 값을 검증 */
function toPositiveInteger(value: unknown): number | null {
  const parsed = toFiniteNumber(value)
  if (parsed == null || !Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

/** DB/RPC가 boolean을 문자열이나 숫자로 돌려줘도 앱 boolean으로 정리 */
function toBoolean(value: unknown) {
  return value === true || value === "true" || value === 1
}

/** 외부 구매 링크는 http/https URL만 앱 모델에 남긴다. */
function toSafeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  return getSafeWebUrl(value) || null
}

/** RPC 결과의 분위수 통계를 배지 판정 로직에서 쓰는 숫자 타입으로 정규화 */
function toPriceStats(row: Record<string, unknown>): PriceStats {
  return {
    p20: toFiniteNumber(row.p20),
    p50: toFiniteNumber(row.p50),
    p80: toFiniteNumber(row.p80),
    sample_count: Math.max(
      0,
      Math.trunc(toFiniteNumber(row.sample_count) ?? 0),
    ),
  }
}

/** 상품 목록을 최신 등록순으로 조회하고 검색어/카테고리 필터를 선택적으로 적용 */
export async function fetchProteins(params?: {
  q?: string
  topic?: ProteinCategory
}) {
  const supabase = getSupabaseClient()
  let query = supabase
    .from("proteins")
    .select("*")
    .order("created_at", { ascending: false })

  const keyword = params?.q?.trim()
  if (keyword) query = query.ilike("title", `%${keyword}%`)
  if (params?.topic) query = query.eq("topic", params.topic)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as ApiProtein[]
}

/** 단일 상품이 없으면 null을 반환해 상세 화면에서 빈 상태를 처리 */
export async function fetchProtein(id: string) {
  const proteinId = parseProteinId(id)
  if (proteinId == null) return null

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("proteins")
    .select("*")
    .eq("protein_id", proteinId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as ApiProtein | null
}

/** 목록 화면에서 사용할 각 상품의 최신 가격과 가격대 배지를 조회 */
export async function fetchLatestProteinPrices(): Promise<ApiProteinPrice[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc("get_latest_protein_prices")
  if (error) throw new Error(error.message)

  return toApiRows(data).flatMap((row) => {
    const proteinId = toPositiveInteger(row.protein_id)
    const price = toFiniteNumber(row.price)
    const observedDate = toNonEmptyString(row.observed_date)
    if (proteinId == null || price == null || !observedDate) return []

    const stats = toPriceStats(row)
    const item: ApiProteinPrice = {
      protein_id: proteinId,
      observed_date: observedDate,
      price,
      available: toBoolean(row.available),
      url: toSafeUrl(row.url),
      per_protein_gram: toFiniteNumber(row.per_protein_gram),
      badge: decideBadge(price, stats),
    }
    return [item]
  })
}

/** 특정 상품의 가격 히스토리와 최신 가격 기준 배지를 함께 조회 */
export async function fetchProteinPrices(
  id: string,
  limit = 180,
): Promise<ApiProteinPriceResult> {
  const proteinId = parseProteinId(id)
  if (proteinId == null) return { items: [], badge: null }

  const normalizedLimit = Number.isFinite(limit)
    ? Math.max(1, Math.trunc(limit))
    : 180
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc("get_protein_price_history", {
    p_protein_id: proteinId,
    p_limit: normalizedLimit,
  })
  if (error) throw new Error(error.message)

  const rows = toApiRows(data)
  const first = rows[0]

  // 히스토리가 없으면 배지를 만들 수 없도록 빈 통계값을 사용
  const stats: PriceStats = first
    ? toPriceStats(first)
    : { p20: null, p50: null, p80: null, sample_count: 0 }

  // DB 숫자/nullable 필드를 앱에서 쓰는 타입으로 변환
  const items: ApiProteinPrice[] = rows.flatMap((row) => {
    const rowProteinId = toPositiveInteger(row.protein_id)
    const rowPrice = toFiniteNumber(row.price)
    const observedDate = toNonEmptyString(row.observed_date)
    if (rowProteinId == null || rowPrice == null || !observedDate) return []

    return [
      {
        protein_id: rowProteinId,
        observed_date: observedDate,
        price: rowPrice,
        available: toBoolean(row.available),
        url: toSafeUrl(row.url),
        per_protein_gram: toFiniteNumber(row.per_protein_gram),
      },
    ]
  })

  return {
    items,
    badge: items.length > 0 ? decideBadge(items[0].price, stats) : null,
  }
}

/** 맛 정보는 호불호가 낮은 항목, 티어, 이름 순서로 정렬해 상세 특징에 표시 */
export async function fetchProteinFlavors(
  id: string,
): Promise<ApiProteinFlavor[]> {
  const proteinId = parseProteinId(id)
  if (proteinId == null) return []

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from("protein_flavors")
    .select("flavor_id, name, tier, polarizing, note")
    .eq("protein_id", proteinId)
    .order("polarizing", { ascending: true })
    .order("tier", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).flatMap((row) => {
    const flavorId = toPositiveInteger(row.flavor_id)
    const name = toNonEmptyString(row.name)
    if (flavorId == null || !name) return []

    const tier =
      row.tier === "T1" || row.tier === "T2" || row.tier === "T3"
        ? row.tier
        : null
    const note = toNonEmptyString(row.note)

    return [
      {
        flavorId,
        name,
        tier,
        polarizing: toBoolean(row.polarizing),
        note,
      },
    ]
  })
}
