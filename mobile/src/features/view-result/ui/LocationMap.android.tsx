import { Image as ExpoImage } from "expo-image"
import { useState } from "react"
import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { cssInterop } from "nativewind"
import { openWebUrl } from "@/shared/lib/legalLinks"
import { GlassSurface } from "@/shared/ui/GlassSurface"
import { getStaticMapTiles } from "../lib/staticMapTiles"

const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright"
const TILE_REQUEST_HEADERS = {
  "User-Agent": "YepBuddy/1.5 (com.juhun.yepbuddy.app)",
}
const Image = cssInterop(ExpoImage, { className: "style" })

interface LocationMapProps {
  latitude: number
  longitude: number
  locationName: string
}

export function LocationMap({
  latitude,
  longitude,
  locationName,
}: LocationMapProps) {
  const { t } = useTranslation()
  const [mapWidth, setMapWidth] = useState(0)
  const tiles = mapWidth
    ? getStaticMapTiles(latitude, longitude, mapWidth, 200)
    : []

  return (
    <GlassSurface cornerRadius={16} paddingSize={0}>
      <View
        className="h-[200px] overflow-hidden bg-yb-surface-muted"
        onLayout={({ nativeEvent }) => setMapWidth(nativeEvent.layout.width)}
      >
        {tiles.map((tile) => (
          <Image
            key={tile.uri}
            source={{ uri: tile.uri, headers: TILE_REQUEST_HEADERS }}
            cachePolicy="disk"
            className="absolute left-0 top-0 h-[256px] w-[256px]"
            style={{
              transform: [
                { translateX: tile.left },
                { translateY: tile.top },
              ],
            }}
          />
        ))}

        <View className="absolute left-1/2 top-1/2 -ml-yb-3 -mt-yb-3 h-yb-6 w-yb-6 items-center justify-center rounded-full bg-yb-accent">
          <View className="h-yb-2 w-yb-2 rounded-full bg-yb-on-accent" />
        </View>

        <Pressable
          accessibilityRole="link"
          accessibilityLabel={t("workout.result.mapAttributionLabel")}
          className="absolute bottom-yb-1 right-yb-1 rounded-yb-xs bg-yb-surface px-yb-1 py-yb-0.5"
          hitSlop={{ top: 24, bottom: 4, left: 12, right: 4 }}
          onPress={() => void openWebUrl(OSM_COPYRIGHT_URL)}
        >
          <Text className="text-yb-caption text-yb-fg-secondary">
            © OpenStreetMap
          </Text>
        </Pressable>
      </View>

      <View className="px-yb-5 py-yb-3">
        <Text className="text-yb-fg-secondary text-yb-caption">
          {t("workout.result.location")} · {locationName}
        </Text>
      </View>
    </GlassSurface>
  )
}
