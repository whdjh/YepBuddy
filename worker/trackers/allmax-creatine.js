import { findProductById, calculateDiscountPrice, savePriceToSupabase, convertToDeeplink } from '../lib/coupangTracker.js';
import 'dotenv/config';

// 상품 설정
const PRODUCT_ID = 211526931;
const PROTEIN_ID = 34;
const SEARCH_KEYWORDS = [
  'Allmax 크레아틴',
  '올맥스 크레아틴',
  'Allmax Creatine',
  '크레아틴 1kg',
  '올맥스 크레아틴 1kg'
];

async function trackProduct() {
  try {
    // 1. 상품 찾기
    const product = await findProductById(PRODUCT_ID, SEARCH_KEYWORDS);

    if (!product) {
      return null;
    }

    // 2. 가격 처리
    let finalPrice = product.productPrice; // 기본값: API 원가

    // 상품명에서 수량 정보 추출 (예: "2.27kg, 2개" 또는 "1개")
    const quantityMatch = product.productName.match(/(\d+)개/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;

    // 2개 세트인 경우 1개 가격으로 계산
    if (quantity > 1) {
      const pricePerUnit = Math.round(product.productPrice / quantity);
      finalPrice = pricePerUnit;
    }

    const envDiscountPercent = parseFloat(process.env.COUPANG_DISCOUNT_PERCENT || '0');
    if (envDiscountPercent > 0) {
      finalPrice = calculateDiscountPrice(finalPrice, envDiscountPercent);
    }

    // 2-1. Deeplink 변환 (파트너스 추적 링크 업데이트)
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

    // 3. Supabase에 저장 (URL 포함)
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

