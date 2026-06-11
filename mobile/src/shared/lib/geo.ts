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

interface Coordinates {
  lat: number
  lng: number
}

/** 두 좌표 사이의 haversine 거리(m)를 계산 */
export function getDistanceMeters(a: Coordinates, b: Coordinates) {
  const earthRadiusMeters = 6_371_000
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const deltaLat = toRadians(b.lat - a.lat)
  const deltaLng = toRadians(b.lng - a.lng)

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2)

  return (
    earthRadiusMeters *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}

/** 각도 값을 삼각함수 계산에 필요한 radian으로 변환 */
function toRadians(value: number) {
  return (value * Math.PI) / 180
}
