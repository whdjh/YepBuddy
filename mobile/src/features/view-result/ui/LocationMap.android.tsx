import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { GlassSurface } from "@/shared/ui/GlassSurface"

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
  const coordinates = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`

  return (
    <GlassSurface cornerRadius={20} paddingSize={20}>
      <View className="gap-yb-2">
        <Text className="text-yb-fg-secondary text-yb-caption">
          {t("workout.result.location")}
        </Text>
        <Text className="text-yb-fg text-yb-body-lg font-semibold">
          {locationName}
        </Text>
        {locationName !== coordinates && (
          <Text className="text-yb-fg-secondary text-yb-caption">
            {coordinates}
          </Text>
        )}
      </View>
    </GlassSurface>
  )
}
