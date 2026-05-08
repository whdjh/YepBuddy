/** JSON 문자열을 파싱하고, 저장값이 깨져 있으면 null로 흡수 */
export function parseJsonOrNull<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}
