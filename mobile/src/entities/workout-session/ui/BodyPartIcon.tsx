import { Image, View, type ImageSourcePropType } from "react-native"
import { RNHostView } from "@expo/ui/swift-ui"
import arms from "@/assets/images/bodyparts/arms.png"
import back from "@/assets/images/bodyparts/back.png"
import chest from "@/assets/images/bodyparts/chest.png"
import core from "@/assets/images/bodyparts/core.png"
import legs from "@/assets/images/bodyparts/legs.png"
import shoulders from "@/assets/images/bodyparts/shoulders.png"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { SymbolView } from "@/shared/ui/SymbolView"
import type { BodyPart } from "../model/types"

type BodyPartIconSize = "xs" | "drawer" | "sm" | "md" | "lg" | "xl"

interface BodyPartIconProps {
  bodyPart?: BodyPart | null
  size?: BodyPartIconSize
  framed?: boolean
}

const frameSizeBySize: Record<BodyPartIconSize, number> = {
  xs: 24,
  drawer: 48,
  sm: 40,
  md: 56,
  lg: 64,
  xl: 72,
}

const iconSizeBySize: Record<BodyPartIconSize, number> = {
  xs: 22,
  drawer: 36,
  sm: 28,
  md: 38,
  lg: 46,
  xl: 54,
}

const radiusBySize: Record<BodyPartIconSize, number> = {
  xs: 0,
  drawer: 12,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
}

// 운동 부위 도메인 값을 화면 아이콘 asset으로 매핑
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
  const { accent, fillPale } = useCardColors()
  const frameSize = frameSizeBySize[size]
  const iconSize = iconSizeBySize[size]
  const iconSource = bodyPart ? iconSourceByBodyPart[bodyPart] : null

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: framed ? fillPale : "transparent",
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
          tintColor={accent}
        />
      )}
    </View>
  )
}

// SwiftUI 카드 내부에 RN 아이콘을 넣기 위한 bridge
export function BodyPartIconHost(props: BodyPartIconProps) {
  return (
    <RNHostView matchContents>
      <BodyPartIcon {...props} />
    </RNHostView>
  )
}
