import { Skia } from "@shopify/react-native-skia"

type ChartPoint = { x: number; y: number | null | undefined }

export const buildLinePath = (points: ChartPoint[]) => {
  const validPoints = points.filter((point) => typeof point.y === "number")
  if (validPoints.length === 0) return null

  const builder = Skia.PathBuilder.Make()
  builder.moveTo(validPoints[0].x, validPoints[0].y as number)
  for (const point of validPoints.slice(1)) {
    builder.lineTo(point.x, point.y as number)
  }
  return builder.build()
}

export const buildAreaPath = (points: ChartPoint[], y0: number) => {
  const validPoints = points.filter((point) => typeof point.y === "number")
  if (validPoints.length === 0) return null

  const builder = Skia.PathBuilder.Make()
  const first = validPoints[0]
  const last = validPoints[validPoints.length - 1]
  if (!first || !last) return null

  builder.moveTo(first.x, y0)
  for (const point of validPoints) {
    builder.lineTo(point.x, point.y as number)
  }
  builder.lineTo(last.x, y0)
  builder.close()
  return builder.build()
}
