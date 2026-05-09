import { SymbolView } from "expo-symbols"
import { View } from "react-native"
import type { BodyPart } from "@/entities/workout-session"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { BodyPartIcon } from "@/shared/ui/BodyPartIcon"

interface BodyPartBadgeProps {
  bodyPart?: BodyPart | null
  size?: "sm" | "md"
  variant?: "bodyPart" | "cardio"
}

const frameSizeBySize = {
  sm: 24,
  md: 56,
}

const cardioIconSizeBySize = {
  sm: 18,
  md: 34,
}

export function BodyPartBadge({
  bodyPart,
  size = "sm",
  variant = "bodyPart",
}: BodyPartBadgeProps) {
  const { accent } = useCardColors()

  if (variant === "cardio") {
    return (
      <View
        style={{
          alignItems: "center",
          height: frameSizeBySize[size],
          justifyContent: "center",
          width: frameSizeBySize[size],
        }}
      >
        <SymbolView
          name="figure.run"
          size={cardioIconSizeBySize[size]}
          tintColor={accent}
        />
      </View>
    )
  }

  return <BodyPartIcon bodyPart={bodyPart} size={size === "sm" ? "xs" : "md"} framed={false} />
}
