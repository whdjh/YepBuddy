import type { LocationGeocodedAddress } from "expo-location"

export const WORKOUT_LOCATION_LABEL_FORMAT_VERSION = 1

type WorkoutLocationAddress = Pick<
  LocationGeocodedAddress,
  | "city"
  | "district"
  | "isoCountryCode"
  | "name"
  | "region"
  | "street"
  | "streetNumber"
>

const normalizeAddressPart = (value: string | null) => value?.trim() || null

/** 역지오코딩 결과를 중복 없는 화면용 주소 라벨로 조합 */
export function formatWorkoutLocationAddress(address: WorkoutLocationAddress) {
  const region = normalizeAddressPart(address.region)
  const city = normalizeAddressPart(address.city)
  const name = normalizeAddressPart(address.name)
  const street = normalizeAddressPart(address.street)
  const district = normalizeAddressPart(address.district)
  const isKoreanAddress = address.isoCountryCode?.toUpperCase() === "KR"
  const detail = isKoreanAddress
    ? name
      ? [name]
      : [street ?? district, normalizeAddressPart(address.streetNumber)]
    : [district, street, name]
  const parts = [region, city, ...detail].filter(
    (value): value is string => value !== null,
  )
  return [...new Set(parts)].join(" ") || null
}
