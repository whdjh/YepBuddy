export const PARTNER_TYPES = [
  {
    label: "정기적",
    value: "full-time",
  },
  {
    label: "자유롭게",
    value: "freelance",
  },
  {
    label: "1회성",
    value: "intership",
  },
] as const;

export const LOCATION_TYPES = [
  {
    label: "온라인",
    value: "remote",
  },
  {
    label: "만나서",
    value: "in-person",
  },
  {
    label: "혼합",
    value: "hybrid",
  },
] as const;

export const TIME_RANGE = [
  "00:00 - 02:00",
  "02:00 - 04:00",
  "04:00 - 06:00",
  "06:00 - 08:00",
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
  "22:00 - 24:00",
] as const;