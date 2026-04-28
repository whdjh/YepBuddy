import axios from 'axios';
import { generateHmac } from '../utils/hmacGenerator.js';
import 'dotenv/config';

// 쿠팡 API 설정
const DOMAIN = 'https://api-gateway.coupang.com';
const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY;
const SECRET_KEY = process.env.COUPANG_SECRET_KEY;

// 쿠팡 파트너스 API 호출 제한
// 검색 50회/분 기준: 60초 / 50회 = 1200ms. 1250ms로 약간의 여유를 둔다.
const MAX_CALLS_PER_RUN = 50;
const MIN_CALL_INTERVAL_MS = 1250;
let callCount = 0;
let lastCallAt = 0;

// 동시 호출 시 레이스 컨디션 방지를 위한 직렬화 큐
let rateLimitQueue = Promise.resolve();

export function waitForRateLimit() {
  rateLimitQueue = rateLimitQueue.then(async () => {
    const now = Date.now();
    const waitMs = Math.max(0, MIN_CALL_INTERVAL_MS - (now - lastCallAt));
    if (waitMs > 0) {
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    callCount++;
    if (callCount > MAX_CALLS_PER_RUN) {
      console.error(`❌ API 호출 한도 도달 (${MAX_CALLS_PER_RUN}회), 중지`);
      throw new Error('API_RATE_LIMIT_EXCEEDED');
    }
    lastCallAt = Date.now();
    console.log(`📡 API ${callCount}/${MAX_CALLS_PER_RUN}`);
  });
  return rateLimitQueue;
}

/**
 * 쿠팡 API v1 - 키워드 검색
 */
export async function searchProducts(keyword, limit = 10) {
  await waitForRateLimit();

  const REQUEST_METHOD = 'GET';
  const URL = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`;

  try {
    const authorization = generateHmac(REQUEST_METHOD, URL, SECRET_KEY, ACCESS_KEY);

    const response = await axios.request({
      method: REQUEST_METHOD,
      url: `${DOMAIN}${URL}`,
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json'
      },
      timeout: 10000, // 10초 타임아웃
    });

    if (response.status === 429) {
      console.error('⚠️ 검색 API 호출 제한 도달 (1분당 50회 또는 전체 100회 초과)');
      throw new Error('API_RATE_LIMIT_EXCEEDED');
    }

    return response.data;
  } catch (err) {
    if (err.response?.status === 429) {
      console.error('❌ 검색 API 호출 제한 초과 (429 Too Many Requests)');
      throw new Error('API_RATE_LIMIT_EXCEEDED');
    }

    const errorData = err.response?.data || {};
    console.error('❌ API 호출 실패:', errorData.message || err.message);
    if (errorData.code) {
      console.error(`   에러 코드: ${errorData.code}`);
    }
    if (errorData.transactionId) {
      console.error(`   트랜잭션 ID: ${errorData.transactionId}`);
    }
    throw err;
  }
}

/**
 * 쿠팡 API - Deeplink 변환 (일반 URL을 파트너스 추적 링크로 변환)
 */
export async function convertToDeeplink(productUrl, subId = '') {
  await waitForRateLimit();

  const REQUEST_METHOD = 'POST';
  const URL = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';

  try {
    const authorization = generateHmac(REQUEST_METHOD, URL, SECRET_KEY, ACCESS_KEY);

    const response = await axios.request({
      method: REQUEST_METHOD,
      url: `${DOMAIN}${URL}`,
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json'
      },
      data: {
        coupangUrls: [productUrl],
        subId: subId || undefined
      },
      timeout: 10000,
    });

    if (response.status === 429) {
      console.error('⚠️ Deeplink API 호출 제한 도달 (1분당 50회 또는 전체 100회 초과)');
      throw new Error('API_RATE_LIMIT_EXCEEDED');
    }

    if (response.data.rCode === '0' && response.data.data && response.data.data.length > 0) {
      return response.data.data[0];
    }

    return null;
  } catch (err) {
    if (err.response?.status === 429) {
      console.error('❌ Deeplink API 호출 제한 초과 (429 Too Many Requests)');
      throw new Error('API_RATE_LIMIT_EXCEEDED');
    }

    const errorData = err.response?.data || {};
    console.error('❌ Deeplink 변환 실패:', errorData.message || err.message);
    throw err;
  }
}
