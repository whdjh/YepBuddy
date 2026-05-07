const WEB_URL_PATTERN = /^https?:\/\/\S+$/i

/** http/https 웹 URL만 허용하고, 잘못된 값은 빈 문자열로 정리 */
export function getSafeWebUrl(value?: string | null) {
  const url = value?.trim() ?? ""
  return WEB_URL_PATTERN.test(url) ? url : ""
}
