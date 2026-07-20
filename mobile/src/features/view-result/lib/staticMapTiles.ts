const TILE_SIZE = 256
const MAX_MERCATOR_LATITUDE = 85.05112878

const STATIC_MAP_ZOOM = 15

export function getStaticMapTiles(
  latitude: number,
  longitude: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const tileCount = 2 ** STATIC_MAP_ZOOM
  const latitudeRadians =
    (Math.max(
      -MAX_MERCATOR_LATITUDE,
      Math.min(MAX_MERCATOR_LATITUDE, latitude),
    ) *
      Math.PI) /
    180
  const normalizedLongitude = ((longitude + 180) % 360 + 360) % 360
  const worldX =
    (normalizedLongitude / 360) * tileCount * TILE_SIZE
  const worldY =
    ((1 -
      Math.asinh(Math.tan(latitudeRadians)) / Math.PI) /
      2) *
    tileCount *
    TILE_SIZE
  const centerTileX = Math.floor(worldX / TILE_SIZE)
  const centerTileY = Math.floor(worldY / TILE_SIZE)
  const columnRadius = Math.ceil(viewportWidth / 2 / TILE_SIZE)
  const rowRadius = Math.ceil(viewportHeight / 2 / TILE_SIZE)
  const tiles = []

  for (let row = -rowRadius; row <= rowRadius; row += 1) {
    const tileY = centerTileY + row
    if (tileY < 0 || tileY >= tileCount) continue

    for (
      let column = -columnRadius;
      column <= columnRadius;
      column += 1
    ) {
      const tileX = centerTileX + column
      const wrappedTileX = ((tileX % tileCount) + tileCount) % tileCount

      tiles.push({
        uri: `https://tile.openstreetmap.org/${STATIC_MAP_ZOOM}/${wrappedTileX}/${tileY}.png`,
        left: viewportWidth / 2 + tileX * TILE_SIZE - worldX,
        top: viewportHeight / 2 + tileY * TILE_SIZE - worldY,
      })
    }
  }

  return tiles
}
