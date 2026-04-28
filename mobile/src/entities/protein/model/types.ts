export type ProteinCategory = "wpc" | "wpi" | "wpcwpi" | "creatine" | "beta-alanine"

export type PriceLevel = "low" | "mid" | "high"

export type PriceBadge = {
  kind: PriceLevel
  color: "green" | "blue" | "red"
  reason: string
}

export interface ApiProtein {
  protein_id: number
  title: string
  weight: number
  avatar_file: string
  topic: ProteinCategory
  taste: string
  description: string | null
  scoop: number | null
  protein_per_scoop: number | null
  base_pack_count: number
  base_date: string
  url: string | null
  created_at: string
  updated_at: string
}

export interface ApiProteinPrice {
  protein_id: number
  observed_date: string
  price: number
  available: boolean
  url?: string | null
  per_protein_gram?: number | null
  badge?: PriceBadge | null
}

export interface ApiProteinPriceResult {
  items: ApiProteinPrice[]
  badge: PriceBadge | null
}

export interface ApiProteinFlavor {
  flavorId: number
  name: string
  tier: "T1" | "T2" | "T3" | null
  polarizing: boolean
  note: string | null
}

export interface Protein {
  id: string
  name: string
  category: ProteinCategory
  categoryLabel: string
  flavor: string
  volume: number
  price: number | null
  pricePerGram: number | null
  priceLevel: PriceLevel
  purchaseUrl: string | null
}

export interface PriceHistoryPoint {
  date: string
  price: number
}

export interface ProteinDetail extends Protein {
  features: string[]
  priceHistory: PriceHistoryPoint[]
}
