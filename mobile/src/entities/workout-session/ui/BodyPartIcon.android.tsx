import { Image, View, type ImageSourcePropType } from "react-native"
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

const frameClassBySize: Record<BodyPartIconSize, string> = {
  xs: "h-yb-6 w-yb-6",
  drawer: "h-yb-icon-md w-yb-icon-md",
  sm: "h-yb-10 w-yb-10",
  md: "h-yb-icon-lg w-yb-icon-lg",
  lg: "h-yb-icon-xl w-yb-icon-xl",
  xl: "h-yb-icon-xl w-yb-icon-xl",
}

const iconClassBySize: Record<BodyPartIconSize, string> = {
  xs: "h-yb-5 w-yb-5",
  drawer: "h-yb-9 w-yb-9",
  sm: "h-yb-8 w-yb-8",
  md: "h-yb-9 w-yb-9",
  lg: "h-yb-12 w-yb-12",
  xl: "h-yb-icon-lg w-yb-icon-lg",
}

const frameRadiusClassBySize: Record<BodyPartIconSize, string> = {
  xs: "rounded-none",
  drawer: "rounded-yb-icon",
  sm: "rounded-yb-sm",
  md: "rounded-yb-icon",
  lg: "rounded-yb-xl",
  xl: "rounded-yb-xl",
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
  const { accent } = useCardColors()
  const iconSource = bodyPart ? iconSourceByBodyPart[bodyPart] : null

  return (
    <View
      className={`items-center justify-center overflow-hidden ${frameClassBySize[size]}${
        framed
          ? ` bg-yb-fill-pale ${frameRadiusClassBySize[size]}`
          : " bg-transparent rounded-none"
      }`}
    >
      {iconSource ? (
        <Image
          source={iconSource}
          resizeMode="contain"
          className={iconClassBySize[size]}
        />
      ) : (
        <SymbolView name="dumbbell.fill" tintColor={accent} />
      )}
    </View>
  )
}

export function BodyPartIconHost(props: BodyPartIconProps) {
  return <BodyPartIcon {...props} />
}
