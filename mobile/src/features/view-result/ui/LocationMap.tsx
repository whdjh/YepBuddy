import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import MapView, { Marker } from "react-native-maps"
import { GlassSurface } from "@/shared/ui/GlassSurface"

interface LocationMapProps {
  latitude: number
  longitude: number
  locationName: string
}

interface MapSize {
  width: number
  height: number
}

export function LocationMap({
  latitude,
  longitude,
  locationName,
}: LocationMapProps) {
  const { t } = useTranslation()
  const [mapSize, setMapSize] = useState<MapSize | null>(null)

  return (
    <GlassSurface cornerRadius={20} paddingSize={0}>
      <View
        className="h-[200px]"
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout
          if (width <= 0 || height <= 0) return

          setMapSize((current) => {
            if (current?.width === width && current.height === height) {
              return current
            }

            return { width, height }
          })
        }}
      >
        {mapSize && (
          <MapView
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude,
              longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{ latitude, longitude }}
              tracksViewChanges={false}
            />
          </MapView>
        )}
      </View>

      <View className="px-yb-5 py-yb-3">
        <Text className="text-yb-fg-secondary text-yb-caption">
          {t("workout.result.location")} · {locationName}
        </Text>
      </View>
    </GlassSurface>
  )
}
