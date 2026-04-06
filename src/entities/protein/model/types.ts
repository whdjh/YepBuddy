export type ProteinCategory = "WPC" | "WPI" | "Blend"

export type PriceLevel = "low" | "mid" | "high"

export interface Protein {
  id: string
  name: string
  category: ProteinCategory
  volume: number
  price: number
  pricePerGram: number
  priceLevel: PriceLevel
}
