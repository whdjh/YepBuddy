import type { ReactNode } from "react"
import { Pressable, Text, View, type ViewProps } from "react-native"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { GlassSurface } from "./GlassSurface"
import { SymbolView, type SymbolViewName } from "./SymbolView"

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

const iconFrameClassByVariant: Record<CardIconVariant, string> = {
  sm: "h-yb-10 w-yb-10 rounded-yb-sm",
  md: "h-yb-icon-sm w-yb-icon-sm rounded-yb-icon",
  lg: "h-yb-icon-lg w-yb-icon-lg rounded-yb-xl",
  xl: "h-yb-icon-xl w-yb-icon-xl rounded-yb-xl",
}

const iconSymbolSizeByVariant: Record<CardIconVariant, number> = {
  sm: 18,
  md: 22,
  lg: 28,
  xl: 28,
}

const dotSymbolSizeByVariant: Record<CardDotVariant, number> = {
  sm: 4,
  lg: 8,
}

const chevronSymbolSizeByVariant: Record<CardChevronVariant, number> = {
  sm: 16,
  md: 18,
}

const spacingClassByValue: Record<number, string> = {
  0: "",
  2: "gap-yb-0.5",
  4: "gap-yb-1",
  6: "gap-yb-1.5",
  8: "gap-yb-2",
  10: "gap-yb-2.5",
  12: "gap-yb-3",
  14: "gap-yb-3.5",
  16: "gap-yb-4",
}

const spacerClassBySize: Record<number, string> = {
  8: "h-yb-2 w-yb-2",
  10: "h-yb-2.5 w-yb-2.5",
  12: "h-yb-3 w-yb-3",
}

const paddingVerticalClassByValue: Record<number, string> = {
  10: "py-yb-2.5",
  16: "py-yb-4",
}

const minHeightClassByValue: Record<number, string> = {
  48: "min-h-yb-touch",
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

    return (
      <GlassSurface
        cornerRadius={cornerRadius}
        minHeight={minHeight}
        paddingSize={paddingSize}
        {...rest}
      >
        {children}
      </GlassSurface>
    )
  }

  const { variant = "default", className, children, ...rest } = props
  return (
    <View
      className={`${containerStyles[variant]}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </View>
  )
}

function Header({
  label,
  chevron,
  more,
  onMorePress,
  badge,
}: {
  label: string
  chevron?: boolean
  more?: string
  onMorePress?: () => void
  badge?: string
}) {
  const { fgSecondary, accent } = useCardColors()
  return (
    <Row spacing={6} alignment="center">
      <Text
        className="text-yb-label font-medium"
        style={{ color: fgSecondary }}
      >
        {label}
      </Text>
      {badge && (
        <Text
          className="text-yb-label font-semibold"
          style={{ color: accent }}
        >
          {badge}
        </Text>
      )}
      <CardSpacer />
      {more && (
        <Text
          className="text-yb-label font-medium"
          style={{ color: fgSecondary }}
        >
          {more}
        </Text>
      )}
      {(chevron || onMorePress) && (
        <Chevron
          variant={chevron ? "md" : "sm"}
          onPress={onMorePress}
        />
      )}
    </Row>
  )
}

function Label({ children }: { children: string }) {
  const { fgSecondary } = useCardColors()
  return (
    <Text
      className="text-yb-label font-medium"
      style={{ color: fgSecondary }}
    >
      {children}
    </Text>
  )
}

function getCaptionClass(size?: number) {
  return size != null && size <= 12
    ? "text-yb-caption font-medium"
    : "text-yb-label font-medium"
}

function Caption({ children, size }: { children: string; size?: number }) {
  const { fgSecondary } = useCardColors()
  return (
    <Text className={getCaptionClass(size)} style={{ color: fgSecondary }}>
      {children}
    </Text>
  )
}

function getTitleClass(size?: number) {
  if (size != null && size >= 22) return "text-yb-heading-md font-bold"
  if (size != null && size >= 20) return "text-yb-heading-sm font-bold"
  return "text-yb-body-md font-bold"
}

function Title({
  children,
  size,
}: {
  children: string
  size?: number
  design?: "default" | "rounded"
}) {
  const { fg } = useCardColors()
  return (
    <Text className={getTitleClass(size)} style={{ color: fg }}>
      {children}
    </Text>
  )
}

function getAccentClass(size?: number) {
  if (size != null && size >= 22) return "text-yb-heading-md font-bold"
  if (size != null && size <= 15) return "text-yb-body-md font-bold"
  return "text-yb-title font-bold"
}

function Accent({ children, size }: { children: string; size?: number }) {
  const { accent } = useCardColors()
  return (
    <Text className={getAccentClass(size)} style={{ color: accent }}>
      {children}
    </Text>
  )
}

function getMetricValueClass(valueSize?: number) {
  if (valueSize != null && valueSize <= 24) return "text-yb-num-sm"
  if (valueSize != null && valueSize <= 28) return "text-yb-num-28"
  if (valueSize != null && valueSize <= 32) return "text-yb-num-md"
  return "text-yb-num-lg"
}

function getMetricUnitClass(unitSize?: number) {
  return unitSize != null && unitSize <= 12
    ? "text-yb-caption font-medium"
    : "text-yb-body-sm font-medium"
}

function Metric({
  value,
  unit,
  valueSize,
  unitSize,
}: {
  value: number | string
  unit: string
  valueSize?: number
  unitSize?: number
}) {
  const { fgSecondary, accent } = useCardColors()
  return (
    <Row alignment="firstTextBaseline" spacing={2}>
      <Text className={getMetricValueClass(valueSize)} style={{ color: accent }}>
        {String(value)}
      </Text>
      <Text className={getMetricUnitClass(unitSize)} style={{ color: fgSecondary }}>
        {` ${unit}`}
      </Text>
    </Row>
  )
}

function Icon({
  name,
  variant = "md",
}: {
  name: SymbolViewName
  variant?: CardIconVariant
}) {
  const { accent } = useCardColors()
  return (
    <View
      className={`items-center justify-center overflow-hidden bg-yb-fill-pale ${iconFrameClassByVariant[variant]}`}
    >
      <SymbolView
        name={name}
        size={iconSymbolSizeByVariant[variant]}
        tintColor={accent}
      />
    </View>
  )
}

function Dot({ variant = "sm" }: { variant?: CardDotVariant }) {
  const { accent } = useCardColors()
  return (
    <SymbolView
      name="circle.fill"
      size={dotSymbolSizeByVariant[variant]}
      tintColor={accent}
    />
  )
}

function Chevron({
  variant = "md",
  onPress,
}: {
  variant?: CardChevronVariant
  onPress?: () => void
}) {
  const { fgSecondary } = useCardColors()
  const content = (
    <SymbolView
      name="chevron.right"
      size={chevronSymbolSizeByVariant[variant]}
      tintColor={fgSecondary}
    />
  )

  if (!onPress) {
    return content
  }

  return <Pressable onPress={onPress}>{content}</Pressable>
}

function CardSpacer({ size }: { size?: number }) {
  if (size == null) {
    return <View className="flex-1" />
  }

  return <View className={spacerClassBySize[size] ?? "h-yb-3 w-yb-3"} />
}

function CardDivider() {
  return <View className="h-px w-full bg-yb-fill-pale" />
}

function getAlignItemsClass(
  alignment?: "top" | "center" | "bottom" | "firstTextBaseline",
) {
  switch (alignment) {
    case "top":
      return "items-start"
    case "center":
      return "items-center"
    case "bottom":
      return "items-end"
    case "firstTextBaseline":
      return "items-baseline"
    default:
      return ""
  }
}

function Row({
  children,
  spacing = 0,
  alignment,
  minHeight,
  paddingVertical,
}: {
  children: ReactNode
  spacing?: number
  alignment?: "top" | "center" | "bottom" | "firstTextBaseline"
  minHeight?: number
  paddingVertical?: number
}) {
  const classes = [
    "flex-row",
    getAlignItemsClass(alignment),
    spacingClassByValue[spacing],
    paddingVertical != null ? paddingVerticalClassByValue[paddingVertical] : "",
    minHeight != null ? minHeightClassByValue[minHeight] : "",
  ]
    .filter(Boolean)
    .join(" ")

  return <View className={classes}>{children}</View>
}

function getColumnAlignmentClass(
  alignment?: "leading" | "center" | "trailing",
) {
  switch (alignment) {
    case "leading":
      return "items-start"
    case "center":
      return "items-center"
    case "trailing":
      return "items-end"
    default:
      return ""
  }
}

function Column({
  children,
  spacing = 0,
  alignment,
}: {
  children: ReactNode
  spacing?: number
  alignment?: "leading" | "center" | "trailing"
}) {
  const classes = [
    "flex-col",
    getColumnAlignmentClass(alignment),
    spacingClassByValue[spacing],
  ]
    .filter(Boolean)
    .join(" ")

  return <View className={classes}>{children}</View>
}

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
