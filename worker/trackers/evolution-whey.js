// 이보루션뉴트리션 100% 유청 단백질 더블 리치 초콜릿 2.268kg(5lbs)
import { findProductById, calculateDiscountPrice, savePriceToSupabase, convertToDeeplink } from '../lib/coupangTracker.js';
import 'dotenv/config';

// 상품 설정
const PRODUCT_ID = 6422282333;
const PROTEIN_ID = 24;
const SEARCH_KEYWORDS = [
  'EVL 100 whey protein double rich chocolate',
  'EVLUTIONNUTRITION 웨이 프로틴 더블 리치 초콜릿',
  '이보루션뉴트리션 100% 유청 단백질'
];

async function trackProduct() {
  try {
    const product = await findProductById(PRODUCT_ID, SEARCH_KEYWORDS);
    if (!product) {
      return null;
    }

    const basePrice = product.salePrice || product.finalPrice || product['final-price'] || product.productPrice || 0;
    let finalPrice = basePrice;

    const envDiscountPercent = parseFloat(process.env.COUPANG_DISCOUNT_PERCENT || '0');
    if (envDiscountPercent > 0) {
      finalPrice = calculateDiscountPrice(basePrice, envDiscountPercent);
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
