export function computeDisplayPrice(basePrice?: number | null, salePercent?: number | null) {
  if (basePrice == null || basePrice <= 0) return null;
  const sale = typeof salePercent === "number" ? salePercent : 0;
  // sale이 1이면 할인 무시 (마이프로틴 제품만 sale 사용, 나머지는 1로 설정되어 있음)
  if (sale === 1) return basePrice;
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
