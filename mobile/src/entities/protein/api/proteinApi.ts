import { supabase } from "./supabaseClient"
import { decideBadge } from "../model/badge"
import type { PriceStats } from "../model/badge"
import type {
  ApiProtein,
  ApiProteinFlavor,
  ApiProteinPrice,
  ApiProteinPriceResult,
  ProteinCategory,
} from "../model/types"

// 상품 목록을 최신 등록순으로 조회하고 검색어/카테고리 필터를 선택적으로 적용
export async function fetchProteins(params?: { q?: string; topic?: ProteinCategory }) {
  let query = supabase
    .from("proteins")
    .select("*")
    .order("created_at", { ascending: false })

  if (params?.q) query = query.ilike("title", `%${params.q}%`)
  if (params?.topic) query = query.eq("topic", params.topic)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as ApiProtein[]
}

// 단일 상품이 없으면 null을 반환해 상세 화면에서 빈 상태를 처리
export async function fetchProtein(id: string) {
  const { data, error } = await supabase
    .from("proteins")
    .select("*")
    .eq("protein_id", Number(id))
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw new Error(error.message)
  }
  return data as ApiProtein | null
}

// 목록 화면에서 사용할 각 상품의 최신 가격과 가격대 배지를 조회
export async function fetchLatestProteinPrices(): Promise<ApiProteinPrice[]> {
  const { data, error } = await supabase.rpc("get_latest_protein_prices")
  if (error) throw new Error(error.message)

  return (data as any[]).map((row) => {
    // RPC 결과의 분위수 통계를 배지 판정 로직에서 쓰는 숫자 타입으로 정규화
    const stats: PriceStats = {
      p20: row.p20 != null ? Number(row.p20) : null,
      p50: row.p50 != null ? Number(row.p50) : null,
      p80: row.p80 != null ? Number(row.p80) : null,
      sample_count: row.sample_count != null ? Number(row.sample_count) : 0,
    }
    return {
      protein_id: Number(row.protein_id),
      observed_date: row.observed_date,
      price: Number(row.price),
      available: Boolean(row.available),
      url: row.url ?? null,
      per_protein_gram: row.per_protein_gram != null ? Number(row.per_protein_gram) : null,
      badge: decideBadge(Number(row.price), stats),
    }
  })
}

// 특정 상품의 가격 히스토리와 최신 가격 기준 배지를 함께 조회
export async function fetchProteinPrices(id: string, limit = 180): Promise<ApiProteinPriceResult> {
  const { data, error } = await supabase.rpc("get_protein_price_history", {
    p_protein_id: Number(id),
    p_limit: limit,
  })
  if (error) throw new Error(error.message)

  const rows = (data as any[]) ?? []
  const first = rows[0]

  // 히스토리가 없으면 배지를 만들 수 없도록 빈 통계값을 사용
  const stats: PriceStats = first
    ? {
        p20: first.p20 != null ? Number(first.p20) : null,
        p50: first.p50 != null ? Number(first.p50) : null,
        p80: first.p80 != null ? Number(first.p80) : null,
        sample_count: first.sample_count != null ? Number(first.sample_count) : 0,
      }
    : { p20: null, p50: null, p80: null, sample_count: 0 }

  // DB 숫자/nullable 필드를 앱에서 쓰는 타입으로 변환
  const items: ApiProteinPrice[] = rows.map((row) => ({
    protein_id: Number(row.protein_id),
    observed_date: row.observed_date,
    price: Number(row.price),
    available: Boolean(row.available),
    url: row.url ?? null,
    per_protein_gram: row.per_protein_gram != null ? Number(row.per_protein_gram) : null,
  }))

  return {
    items,
    badge: first ? decideBadge(Number(first.price), stats) : null,
  }
}

// 맛 정보는 호불호가 낮은 항목, 티어, 이름 순서로 정렬해 상세 특징에 표시
export async function fetchProteinFlavors(id: string): Promise<ApiProteinFlavor[]> {
  const { data, error } = await supabase
    .from("protein_flavors")
    .select("flavor_id, name, tier, polarizing, note")
    .eq("protein_id", Number(id))
    .order("polarizing", { ascending: true })
    .order("tier", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    flavorId: Number(row.flavor_id),
    name: row.name as string,
    tier: (row.tier as "T1" | "T2" | "T3" | null) ?? null,
    polarizing: row.polarizing as boolean,
    note: (row.note as string | null) ?? null,
  }))
}
