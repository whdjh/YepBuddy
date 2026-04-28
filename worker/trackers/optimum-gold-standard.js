// 옵티멈뉴트리션 골드 스탠다드 웨이 프로틴 아이솔레이트 단백질 보충제 더블 리치 초콜릿, 2.27kg
import { findProductById, calculateDiscountPrice, savePriceToSupabase, convertToDeeplink } from '../lib/coupangTracker.js';
import 'dotenv/config';

// 상품 설정
const PRODUCT_ID = 7206051468;
const PROTEIN_ID = 30;
const SEARCH_KEYWORDS = [
  '옵티멈뉴트리션 골드 스탠다드 웨이 단백질 초코맛 파우더',
  '옵티멈뉴트리션 골드 스탠다드 아이솔레이트',
  'OPTIMUM GOLD STANDARD ISOLATE',
  '옵티멈 골드 스탠다드 더블 리치 초콜릿',
  'ON 골드 스탠다드 아이솔레이트'
];

async function trackProduct() {
  try {
    const product = await findProductById(PRODUCT_ID, SEARCH_KEYWORDS);
    if (!product) {
      return null;
    }

    // 중량 확인 (2.27kg 이상 필요)
    const MIN_WEIGHT = 2.27;
    const weightMatch = product.productName.match(/(\d+\.?\d*)\s*(?:kg|Kg|KG)/);
    if (weightMatch) {
      const weight = parseFloat(weightMatch[1]);
      if (weight < MIN_WEIGHT) {
        return null;
      }
    } else {
      // g 단위도 체크
      const weightGMatch = product.productName.match(/(\d+)\s*(?:g|G)/);
      if (weightGMatch) {
        const weightG = parseFloat(weightGMatch[1]);
        const weightKg = weightG / 1000;
        if (weightKg < MIN_WEIGHT) {
          return null;
        }
      }
    }

    const basePrice = product.salePrice || product.finalPrice || product['final-price'] || product.productPrice || 0;
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
    return { productName: product.productName, finalPrice };
  } catch (err) {
    if (err.message === 'API_RATE_LIMIT_EXCEEDED') {
      console.error('❌ API 호출 제한 초과');
      process.exit(1);
    }
    console.error('❌ 오류 발생:', err.message);
    return null;
  }
}

trackProduct().then(result => {
  if (result) {
    console.log(result.productName);
    console.log(`💰 가격: ${result.finalPrice.toLocaleString()}원`);
  }
});

