import type { ReactNode } from "react"
import type { SFSymbol } from "sf-symbols-typescript"
import { View, type ViewProps, type ViewStyle } from "react-native"
import { Host, VStack, HStack, Text as SwiftText, Image, Spacer, Divider, Gauge } from "@expo/ui/swift-ui"
import {
  glassEffect,
  frame,
  padding,
  font,
  foregroundStyle,
  background,
  gaugeStyle,
  tint,
  clipShape,
  shapes,
} from "@expo/ui/swift-ui/modifiers"
import { useCardColors } from "@/shared/hooks/useCardColors"

/* Card */
type CardVariant = "default" | "subtle" | "glass"

interface CardBaseProps extends ViewProps {
  variant?: Exclude<CardVariant, "glass">
}

interface CardGlassProps {
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

function CardComponent(props: CardProps) {
  const { glassTint } = useCardColors()

  if (props.variant === "glass") {
    const { children, minHeight, cornerRadius = 16, paddingSize = 20 } = props
    const hostStyle: ViewStyle | undefined = minHeight ? { minHeight } : undefined

    return (
      <Host matchContents={{ vertical: true }} ignoreSafeArea="all" style={hostStyle}>
        <VStack
          spacing={0}
          modifiers={[
            padding({ top: paddingSize, leading: paddingSize, bottom: paddingSize, trailing: paddingSize }),
            frame({ maxWidth: 9999 }),
            glassEffect({
              glass: { variant: "regular", interactive: true, tint: glassTint },
              shape: "roundedRectangle",
              cornerRadius,
            }),
          ]}
        >
          {children}
        </VStack>
      </Host>
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
/** 헤더: 라벨 + 선택적 더보기/셰브론 */
function Header({ label, chevron, more, onMorePress }: {
  label: string
  chevron?: boolean
  more?: string
  onMorePress?: () => void
}) {
  const { fgSecondary, accent } = useCardColors()
  return (
    <HStack>
      <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
        {label}
      </SwiftText>
      <Spacer />
      {more && (
        <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
          {more}
        </SwiftText>
      )}
      {(chevron || onMorePress) && (
        <Image
          systemName="chevron.right"
          size={chevron ? 14 : 12}
          color={chevron ? fgSecondary : accent}
          onPress={onMorePress}
        />
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
      <SwiftText modifiers={[font({ size: unitSize, weight: "medium" }), foregroundStyle(fgSecondary)]}>
        {` ${unit}`}
      </SwiftText>
    </HStack>
  )
}

/** SF Symbol 아이콘 + 배경 */
function Icon({ name, size = 22, bgSize = 44, cornerRadius = 10 }: {
  name: SFSymbol
  size?: number
  bgSize?: number
  cornerRadius?: number
}) {
  const { accent, fillPale } = useCardColors()
  return (
    <Image
      systemName={name}
      size={size}
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
function Dot({ size = 4 }: { size?: number }) {
  const { accent } = useCardColors()
  return <Image systemName="circle.fill" size={size} color={accent} />
}

/** 셰브론 아이콘 */
function Chevron({ size = 18, onPress }: { size?: number; onPress?: () => void }) {
  const { fgSecondary } = useCardColors()
  return (
    <Image
      systemName="chevron.right"
      size={size}
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
function Column({ children, spacing, alignment }: {
  children: ReactNode
  spacing?: number
  alignment?: "leading" | "center" | "trailing"
}) {
  return (
    <VStack alignment={alignment} spacing={spacing}>
      {children}
    </VStack>
  )
}

/** 원형 프로그레스 게이지 */
function CardGauge({ current, target, width = 90, height = 90, children }: {
  current: number
  target: number
  width?: number
  height?: number
  children?: ReactNode
}) {
  const { accent, fgSecondary } = useCardColors()
  const progress = target > 0 ? current / target : 0
  const color = progress > 0 ? accent : fgSecondary
  return (
    <Gauge
      value={progress}
      modifiers={[
        gaugeStyle("circularCapacity"),
        frame({ width, height }),
        tint(color),
      ]}
    >
      {children}
    </Gauge>
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
  Gauge: CardGauge,
  Spacer: CardSpacer,
  Divider: CardDivider,
  Row,
  Column,
})
