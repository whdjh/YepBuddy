import { SymbolView } from "expo-symbols"
import { Image, View, type ImageSourcePropType } from "react-native"
import { RNHostView } from "@expo/ui/swift-ui"
import arms from "@/assets/images/bodyparts/arms.png"
import back from "@/assets/images/bodyparts/back.png"
import chest from "@/assets/images/bodyparts/chest.png"
import core from "@/assets/images/bodyparts/core.png"
import legs from "@/assets/images/bodyparts/legs.png"
import shoulders from "@/assets/images/bodyparts/shoulders.png"
import type { BodyPart } from "@/entities/workout-session"

type BodyPartIconSize = "xs" | "drawer" | "sm" | "md" | "lg" | "xl"

interface BodyPartIconProps {
  bodyPart?: BodyPart | null
  size?: BodyPartIconSize
  framed?: boolean
}

const frameSizeBySize: Record<BodyPartIconSize, number> = {
  xs: 24,
  drawer: 36,
  sm: 40,
  md: 56,
  lg: 64,
  xl: 72,
}

const iconSizeBySize: Record<BodyPartIconSize, number> = {
  xs: 22,
  drawer: 28,
  sm: 28,
  md: 38,
  lg: 46,
  xl: 54,
}

const radiusBySize: Record<BodyPartIconSize, number> = {
  xs: 0,
  drawer: 8,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
}

const iconSourceByBodyPart: Record<BodyPart, ImageSourcePropType> = {
  arms,
  back,
  chest,
  core,
  legs,
  shoulders,
}

export function BodyPartIcon({
  bodyPart,
  size = "md",
  framed = true,
}: BodyPartIconProps) {
  const frameSize = frameSizeBySize[size]
  const iconSize = iconSizeBySize[size]
  const iconSource = bodyPart ? iconSourceByBodyPart[bodyPart] : null

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: framed ? "#F2EBDD" : "transparent",
        borderRadius: framed ? radiusBySize[size] : 0,
        height: frameSize,
        justifyContent: "center",
        overflow: "hidden",
        width: frameSize,
      }}
    >
      {iconSource ? (
        <Image
          source={iconSource}
          resizeMode="contain"
          style={{ height: iconSize, width: iconSize }}
        />
      ) : (
        <SymbolView
          name="dumbbell.fill"
          size={Math.round(iconSize * 0.58)}
          tintColor="#9B7E56"
        />
      )}
    </View>
  )
}

export function BodyPartIconHost(props: BodyPartIconProps) {
  return (
    <RNHostView matchContents>
      <BodyPartIcon {...props} />
    </RNHostView>
  )
}
