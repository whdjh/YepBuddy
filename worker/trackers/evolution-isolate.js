// EVLUTIONNUTRITION 아이솔레이트 프로틴 더블 리치 초콜릿 맛, 2.268kg
import { findProductById, calculateDiscountPrice, savePriceToSupabase, convertToDeeplink } from '../lib/coupangTracker.js';
import 'dotenv/config';

// 상품 설정
const PRODUCT_ID = 6422282284; // EVLUTIONNUTRITION 아이솔레이트 프로틴 더블 리치 초콜릿
const PROTEIN_ID = 25;
const SEARCH_KEYWORDS = [
  'EVLUTIONNUTRITION 아이솔레이트 더블 리치',
  '이보루션뉴트리션 아이솔레이트 더블 리치 초콜릿',
  'EVL 아이솔레이트 2.268kg',
  '이보루션뉴트리션 아이솔레이트 초콜릿'
];

async function trackProduct() {
  try {
    const product = await findProductById(PRODUCT_ID, SEARCH_KEYWORDS);
    if (!product) {
      return null;
    }

    let finalPrice = product.productPrice;
    const envDiscountPercent = parseFloat(process.env.COUPANG_DISCOUNT_PERCENT || '0');
    if (envDiscountPercent > 0) {
      finalPrice = calculateDiscountPrice(product.productPrice, envDiscountPercent);
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
