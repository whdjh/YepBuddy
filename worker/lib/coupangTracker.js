import { createClient } from '@supabase/supabase-js';
import { searchProducts, convertToDeeplink } from './coupangApi.js';
import 'dotenv/config';

// Deeplink 변환 함수 export
export { convertToDeeplink };

export const MAX_KEYWORD_ATTEMPTS_PER_PRODUCT = 2;

// Supabase 연결
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export function getSearchKeywordsToTry(searchKeywords, maxAttempts = MAX_KEYWORD_ATTEMPTS_PER_PRODUCT) {
  const keywords = Array.isArray(searchKeywords) ? searchKeywords : [searchKeywords];
  return keywords.slice(0, maxAttempts);
}

/**
 * productId로 상품 찾기 (단일 키워드)
 * @param {number} productId - 찾을 productId
 * @param {string} searchKeyword - 검색 키워드
 * @param {boolean} returnAllMatches - true면 같은 productId의 모든 결과 반환
 */
async function findProductByIdWithKeyword(productId, searchKeyword, returnAllMatches = false) {
  try {
    // limit 10은 쿠팡 파트너스 검색 API 안전 범위다.
    const result = await searchProducts(searchKeyword, 10);

    if (result.rCode === '0' && result.data?.productData) {
      const products = result.data.productData;
      const matchedProducts = products.filter(p => p.productId === productId);

      if (returnAllMatches && matchedProducts.length > 0) {
        return matchedProducts;
      } else if (matchedProducts.length > 0) {
        return matchedProducts[0];
      }
    }
    return null;
  } catch (err) {
    if (err.message === 'API_RATE_LIMIT_EXCEEDED') {
      throw err;
    }
    console.error(`  ❌ 키워드 "${searchKeyword}" 검색 실패:`, err.message);
    return null;
  }
}

/**
 * productId로 상품 찾기 (여러 키워드 시도)
 * @param {number} productId - 찾을 productId
 * @param {string|string[]} searchKeywords - 검색 키워드(들)
 * @param {boolean} returnAllMatches - true면 같은 productId의 모든 결과 반환
 */
export async function findProductById(productId, searchKeywords, returnAllMatches = false) {
  const keywords = getSearchKeywordsToTry(searchKeywords);

  // 각 키워드로 시도
  for (const keyword of keywords) {
    try {
      const product = await findProductByIdWithKeyword(productId, keyword, returnAllMatches);
      if (product) {
        return product;
      }
    } catch (err) {
      if (err.message === 'API_RATE_LIMIT_EXCEEDED') {
        throw err;
      }
      // 다음 키워드로 계속 시도
      continue;
    }
  }

  return null;
}

/**
 * 할인가격 계산
 */
export function calculateDiscountPrice(originalPrice, discountPercent) {
  if (!discountPercent) return originalPrice;
  const discount = Math.round(originalPrice * (discountPercent / 100));
  return originalPrice - discount;
}

/**
 * Supabase에 가격 데이터 저장
 */
export async function savePriceToSupabase(productId, proteinId, finalPrice, url = null) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const insertData = {
    observed_date: todayStr,
    price: finalPrice,
    available: true,
    protein_id: proteinId,
  };

  // URL이 있으면 추가
  if (url) {
    insertData.url = url;
  }

  try {
    // UPSERT 사용: 중복된 날짜/상품이 있으면 업데이트, 없으면 삽입
    const { data, error } = await supabase
      .from('protein_prices_daily')
      .upsert([insertData], {
        onConflict: 'protein_id,observed_date',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      // protein_id 필수 에러인 경우 대비
      if (error.message.includes('protein_id') || error.code === '23502') {
        console.error('❌ Supabase upsert 실패: protein_id가 필요합니다.');
        return false;
      } else if (error.message.includes('duplicate key') || error.code === '23505') {
        // 중복 키 에러 시 기존 레코드 업데이트 시도
        const updateData_obj = { price: finalPrice, available: true };
        if (url) {
          updateData_obj.url = url;
        }
        const { data: updateData, error: updateError } = await supabase
          .from('protein_prices_daily')
          .update(updateData_obj)
          .eq('protein_id', proteinId)
          .eq('observed_date', todayStr)
          .select();

        if (updateError) {
          console.error('❌ Supabase update 실패:', updateError.message);
          return false;
        } else {
          return true;
        }
      } else {
        console.error('❌ Supabase upsert 실패:', error.message);
        return false;
      }
    } else {
      return true;
    }
  } catch (dbErr) {
    console.error('❌ 데이터베이스 연결 실패:', dbErr.message);
    return false;
  }
}
