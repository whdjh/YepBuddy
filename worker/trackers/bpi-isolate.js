// 비피아이스포츠 아이소 HD 퓨어 아이솔레이트 프로틴 초콜릿 브라우니
import { findProductById, calculateDiscountPrice, savePriceToSupabase, convertToDeeplink } from '../lib/coupangTracker.js';
import 'dotenv/config';

// 상품 설정
const PRODUCT_ID = 8779692760;
const PROTEIN_ID = 28;
const SEARCH_KEYWORDS = [
  '비피아이스포츠 아이소 HD',
  'BPI 아이소 HD 아이솔레이트',
  '비피아이스포츠 아이솔레이트 초콜릿 브라우니',
  'BPI ISO HD isolate'
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

    const saved = await savePriceToSupabase(PRODUCT_ID, PROTEIN_ID, finalPrice, trackingUrl);
    if (saved) {
      console.log(`✅ Supabase 저장 성공`);
    } else {
      console.log(`⚠️  Supabase 저장 실패`);
    }
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
