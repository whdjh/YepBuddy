/** 위도/경도가 실제 좌표 범위 안의 유한한 숫자인지 확인 */
export function isValidCoordinates(latitude: number, longitude: number) {
  return (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  )
}
