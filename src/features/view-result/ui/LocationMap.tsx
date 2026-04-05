import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import MapView, { Marker } from "react-native-maps"

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

  return (
    <View className="overflow-hidden rounded-[20px]">
      <View className="h-[200px]">
        <MapView
          style={{ width: "100%", height: "100%" }}
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
          <Marker coordinate={{ latitude, longitude }} />
        </MapView>
      </View>

      <View className="px-yb-5 py-yb-3">
        <Text className="text-yb-fg-secondary text-yb-caption">
          {t("workout.result.location")} · {locationName}
        </Text>
      </View>
    </View>
  )
}
