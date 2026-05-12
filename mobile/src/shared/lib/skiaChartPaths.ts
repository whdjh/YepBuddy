import { Skia } from "@shopify/react-native-skia"

type ChartPoint = { x: number; y: number | null | undefined }

export const buildLinePath = (points: ChartPoint[]) => {
  const validPoints = points.filter((point) => typeof point.y === "number")
  if (validPoints.length < 2) return null

  const path = Skia.Path.Make()
  path.moveTo(validPoints[0].x, validPoints[0].y as number)
  for (const point of validPoints.slice(1)) {
    path.lineTo(point.x, point.y as number)
  }
  return path
}

export const buildAreaPath = (points: ChartPoint[], y0: number) => {
  const validPoints = points.filter((point) => typeof point.y === "number")
  if (validPoints.length < 2) return null

  const path = Skia.Path.Make()
  const first = validPoints[0]
  const last = validPoints[validPoints.length - 1]
  if (!first || !last) return null

  path.moveTo(first.x, y0)
  for (const point of validPoints) {
    path.lineTo(point.x, point.y as number)
  }
  path.lineTo(last.x, y0)
  path.close()
  return path
}
