import crypto from 'node:crypto';

export function formatCoupangSignedDate(date = new Date()) {
  const iso = date.toISOString();
  return [
    iso.slice(2, 4),
    iso.slice(5, 7),
    iso.slice(8, 10),
    'T',
    iso.slice(11, 13),
    iso.slice(14, 16),
    iso.slice(17, 19),
    'Z',
  ].join('');
}

/**
 * 쿠팡 파트너스 API용 HMAC 서명 생성
 * @param {string} method - HTTP 메서드 (GET, POST 등)
 * @param {string} url - API 엔드포인트 경로 (예: /v2/providers/...)
 * @param {string} secretKey - 쿠팡 Secret Key
 * @param {string} accessKey - 쿠팡 Access Key
 * @returns {string} Authorization 헤더 값
 */
export function generateHmac(method, url, secretKey, accessKey) {
  const parts = url.split(/\?/);
  const [path, query = ''] = parts;

  const datetime = formatCoupangSignedDate();
  const message = datetime + method + path + query;

  const signature = crypto.createHmac('sha256', secretKey)
    .update(message)
    .digest('hex');

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, signature=${signature}`;
}
