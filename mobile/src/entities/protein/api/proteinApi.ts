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

export async function fetchLatestProteinPrices(): Promise<ApiProteinPrice[]> {
  const { data, error } = await supabase.rpc("get_latest_protein_prices")
  if (error) throw new Error(error.message)

  return (data as any[]).map((row) => {
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

export async function fetchProteinPrices(id: string, limit = 180): Promise<ApiProteinPriceResult> {
  const { data, error } = await supabase.rpc("get_protein_price_history", {
    p_protein_id: Number(id),
    p_limit: limit,
  })
  if (error) throw new Error(error.message)

  const rows = (data as any[]) ?? []
  const first = rows[0]

  const stats: PriceStats = first
    ? {
        p20: first.p20 != null ? Number(first.p20) : null,
        p50: first.p50 != null ? Number(first.p50) : null,
        p80: first.p80 != null ? Number(first.p80) : null,
        sample_count: first.sample_count != null ? Number(first.sample_count) : 0,
      }
    : { p20: null, p50: null, p80: null, sample_count: 0 }

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
