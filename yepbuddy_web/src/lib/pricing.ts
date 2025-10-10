export function computeDisplayPrice(basePrice?: number | null, salePercent?: number | null) {
  if (basePrice == null || basePrice <= 0) return null;
  const sale = typeof salePercent === "number" ? salePercent : 0;
  return Math.round(basePrice * (1 - sale / 100));
}

export function computePerProteinGram(displayPrice: number, weight: number, scoop?: number | null, proteinPerScoop?: number | null) {
  if (displayPrice <= 0) return null;
  if (weight > 0 && scoop && scoop > 0 && proteinPerScoop && proteinPerScoop > 0) {
    const totalProteinGrams = weight * (proteinPerScoop / scoop);
    if (totalProteinGrams > 0) return Math.round(displayPrice / totalProteinGrams);
  }
  if (weight > 0) return Math.round(displayPrice / weight);
  return null;
}
