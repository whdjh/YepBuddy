// 옵티멈뉴트리션 플래티넘 하이드로 웨이 프로틴 아이솔레이트 터보 초콜릿, 1.64kg
import { findProductById, calculateDiscountPrice, savePriceToSupabase, convertToDeeplink } from '../lib/coupangTracker.js';
import 'dotenv/config';

// 상품 설정
const PRODUCT_ID = 7320778906;
const PROTEIN_ID = 31;
const SEARCH_KEYWORDS = [
  '옵티멈 하이드로 웨이 프로틴 초코',
  '옵티멈뉴트리션 플래티넘 하이드로 웨이',
  'optimum platinum hydrowhey chocolate'
];

async function trackProduct() {
  try {
    const product = await findProductById(PRODUCT_ID, SEARCH_KEYWORDS);
    if (!product) {
      return null;
    }

    const basePrice = product.salePrice || product.productPrice || 0;
    let finalPrice = basePrice;

    const quantityMatch = product.productName.match(/(\d+)개\s*(세트)?/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

    if (quantity > 1) {
      finalPrice = Math.round(basePrice / quantity);
    }

    const envDiscountPercent = parseFloat(process.env.COUPANG_DISCOUNT_PERCENT || '0');
    if (envDiscountPercent > 0) {
      finalPrice = calculateDiscountPrice(finalPrice, envDiscountPercent);
    }

    let trackingUrl = product.productUrl;
    try {
      const generalUrl = `https://www.coupang.com/vp/products/${PRODUCT_ID}`;
      const deeplink = await convertToDeeplink(generalUrl);
      if (deeplink) {
        trackingUrl = deeplink.landingUrl;
      }
    } catch (err) {
      // 원본 URL 사용
    }

    await savePriceToSupabase(PRODUCT_ID, PROTEIN_ID, finalPrice, trackingUrl);
    return product.productName;
  } catch (err) {
    if (err.message === 'API_RATE_LIMIT_EXCEEDED') {
      console.error('❌ API 호출 제한 초과');
      process.exit(1);
    }
    console.error('❌ 오류 발생:', err.message);
    return null;
  }
}

trackProduct().then(productName => {
  if (productName) {
    console.log(productName);
  }
});
