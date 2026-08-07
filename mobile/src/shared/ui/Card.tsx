import type { ReactNode } from "react"
import { StyleSheet, View, type ViewProps } from "react-native"
import { Host, VStack, HStack, Text as SwiftText, Image, Spacer, Divider } from "@expo/ui/swift-ui"
import {
  frame,
  padding,
  font,
  foregroundStyle,
  background,
  clipShape,
  shapes,
} from "@expo/ui/swift-ui/modifiers"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { GlassSurface } from "./GlassSurface"
import type { SymbolViewName } from "./SymbolView"

/* Card */
type CardVariant = "default" | "subtle" | "glass"
type CardIconVariant = "sm" | "md" | "lg" | "xl"
type CardDotVariant = "sm" | "lg"
type CardChevronVariant = "sm" | "md"

interface CardBaseProps extends ViewProps {
  variant?: Exclude<CardVariant, "glass">
}

interface CardGlassProps extends Omit<ViewProps, "children"> {
  variant: "glass"
  children: ReactNode
  minHeight?: number
  cornerRadius?: number
  paddingSize?: number
}

type CardProps = CardBaseProps | CardGlassProps

const containerStyles: Record<Exclude<CardVariant, "glass">, string> = {
  default:
    "rounded-yb-xl p-yb-6 bg-yb-surface border border-yb-border shadow-sm",
  subtle:
    "rounded-yb-md p-yb-4 bg-yb-surface-subtle border border-yb-border",
}

const iconFrameSizeByVariant: Record<CardIconVariant, number> = {
  sm: 40,
  md: 44,
  lg: 56,
  xl: 64,
}

const iconSymbolSizeByVariant: Record<CardIconVariant, number> = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 28,
}

const iconCornerRadiusByVariant: Record<CardIconVariant, number> = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 16,
}

const dotSymbolSizeByVariant: Record<CardDotVariant, number> = {
  sm: 4,
  lg: 8,
}

const chevronSymbolSizeByVariant: Record<CardChevronVariant, number> = {
  sm: 16,
  md: 18,
}

function CardComponent(props: CardProps) {
  if (props.variant === "glass") {
    const {
      variant: _variant,
      children,
      minHeight,
      cornerRadius = 16,
      paddingSize = 24,
      ...rest
    } = props
    const contentMinHeight =
      minHeight != null ? Math.max(0, minHeight - paddingSize * 2) : undefined

    return (
      <GlassSurface
        cornerRadius={cornerRadius}
        minHeight={minHeight}
        paddingSize={paddingSize}
        {...rest}
      >
        <Host
          matchContents={{ vertical: true }}
          ignoreSafeArea="all"
          style={[
            styles.swiftHost,
            contentMinHeight != null ? { minHeight: contentMinHeight } : null,
          ]}
        >
          <VStack
            spacing={0}
            modifiers={[frame({ maxWidth: 9999 })]}
          >
            {children}
          </VStack>
        </Host>
      </GlassSurface>
    )
  }

  const { variant = "default", className, children, ...rest } = props
  return (
    <View className={`${containerStyles[variant]}${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </View>
  )
}

/* Sub-components */
/** 헤더: 라벨 + 선택적 배지/더보기/셰브론 */
function Header({ label, chevron, more, onMorePress, badge }: {
  label: string
  chevron?: boolean
  more?: string
  onMorePress?: () => void
  badge?: string
}) {
  const { fgSecondary, accent } = useCardColors()
  return (
    <HStack spacing={6}>
      <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
        {label}
      </SwiftText>
      {badge && (
        <SwiftText
          modifiers={[
            font({ size: 13, weight: "semibold" }),
            foregroundStyle(accent),
          ]}
        >
          {badge}
        </SwiftText>
      )}
      <Spacer />
      {more && (
        <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
          {more}
        </SwiftText>
      )}
      {(chevron || onMorePress) && (
        <Chevron variant={chevron ? "md" : "sm"} onPress={onMorePress} />
      )}
    </HStack>
  )
}

/** 라벨 */
function Label({ children, size = 13 }: { children: string; size?: number }) {
  const { fgSecondary } = useCardColors()
  return (
    <SwiftText modifiers={[font({ size, weight: "medium" }), foregroundStyle(fgSecondary)]}>
      {children}
    </SwiftText>
  )
}

/** 캡션 */
function Caption({ children, size = 13 }: { children: string; size?: number }) {
  const { fgSecondary } = useCardColors()
  return (
    <SwiftText modifiers={[font({ size, weight: "medium" }), foregroundStyle(fgSecondary)]}>
      {children}
    </SwiftText>
  )
}

/** 타이틀 */
function Title({ children, size = 15, design }: {
  children: string
  size?: number
  design?: "default" | "rounded"
}) {
  const { fg } = useCardColors()
  return (
    <SwiftText modifiers={[font({ size, weight: "bold", design }), foregroundStyle(fg)]}>
      {children}
    </SwiftText>
  )
}

/** 강조 텍스트 */
function Accent({ children, size = 18 }: { children: string; size?: number }) {
  const { accent } = useCardColors()
  return (
    <SwiftText modifiers={[font({ size, weight: "bold" }), foregroundStyle(accent)]}>
      {children}
    </SwiftText>
  )
}

/** 메트릭 */
function Metric({ value, unit, valueSize = 36, unitSize = 14 }: {
  value: number | string
  unit: string
  valueSize?: number
  unitSize?: number
}) {
  const { fgSecondary, accent } = useCardColors()
  return (
    <HStack alignment="firstTextBaseline" spacing={2}>
      <SwiftText modifiers={[font({ size: valueSize, weight: "bold", design: "rounded" }), foregroundStyle(accent)]}>
        {String(value)}
      </SwiftText>
      {unit ? (
        <SwiftText modifiers={[font({ size: unitSize, weight: "medium" }), foregroundStyle(fgSecondary)]}>
          {` ${unit}`}
        </SwiftText>
      ) : null}
    </HStack>
  )
}

/** SF Symbol 아이콘 + 배경 */
function Icon({ name, variant = "md" }: {
  name: SymbolViewName
  variant?: CardIconVariant
}) {
  const { accent, fillPale } = useCardColors()
  const bgSize = iconFrameSizeByVariant[variant]
  const cornerRadius = iconCornerRadiusByVariant[variant]
  return (
    <Image
      systemName={name}
      size={iconSymbolSizeByVariant[variant]}
      color={accent}
      modifiers={[
        frame({ width: bgSize, height: bgSize }),
        background(fillPale, shapes.roundedRectangle({ cornerRadius })),
        clipShape("roundedRectangle", cornerRadius),
      ]}
    />
  )
}

/** 구분점 */
function Dot({ variant = "sm" }: { variant?: CardDotVariant }) {
  const { accent } = useCardColors()
  return <Image systemName="circle.fill" size={dotSymbolSizeByVariant[variant]} color={accent} />
}

/** 셰브론 아이콘 */
function Chevron({ variant = "md", onPress }: { variant?: CardChevronVariant; onPress?: () => void }) {
  const { fgSecondary } = useCardColors()
  return (
    <Image
      systemName="chevron.right"
      size={chevronSymbolSizeByVariant[variant]}
      color={fgSecondary}
      onPress={onPress}
    />
  )
}

/** Spacer 래퍼 (size 없으면 flex spacer) */
function CardSpacer({ size }: { size?: number }) {
  return <Spacer minLength={size} />
}

/** Divider 래퍼 */
function CardDivider() {
  return <Divider />
}

/** 가로 레이아웃 */
function Row({ children, spacing = 0, alignment, minHeight: mh, paddingVertical }: {
  children: ReactNode
  spacing?: number
  alignment?: "top" | "center" | "bottom" | "firstTextBaseline"
  minHeight?: number
  paddingVertical?: number
}) {
  const mods = []
  if (paddingVertical != null) mods.push(padding({ top: paddingVertical, bottom: paddingVertical }))
  if (mh != null) mods.push(frame({ minHeight: mh }))
  return (
    <HStack spacing={spacing} alignment={alignment} modifiers={mods.length > 0 ? mods : undefined}>
      {children}
    </HStack>
  )
}

/** 세로 레이아웃 */
function Column({ children, spacing, alignment, fullWidth = false }: {
  children: ReactNode
  spacing?: number
  alignment?: "leading" | "center" | "trailing"
  fullWidth?: boolean
}) {
  const modifiers = fullWidth ? [frame({ maxWidth: 9999 })] : undefined
  return (
    <VStack alignment={alignment} spacing={spacing} modifiers={modifiers}>
      {children}
    </VStack>
  )
}

/* ── Export ── */

export const Card = Object.assign(CardComponent, {
  Header,
  Label,
  Caption,
  Title,
  Accent,
  Metric,
  Icon,
  Dot,
  Chevron,
  Spacer: CardSpacer,
  Divider: CardDivider,
  Row,
  Column,
})

const styles = StyleSheet.create({
  swiftHost: {
    width: "100%",
  },
})
