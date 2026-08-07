import { Pressable } from "react-native"
import { Card } from "./Card"

interface StatCardProps {
  label: string
  subtitle?: string
  value: number | string
  unit: string
  minHeight?: number
  valueSize?: number
  onLongPress?: () => void
}

export function StatCard({
  label,
  subtitle,
  value,
  unit,
  minHeight = 120,
  valueSize,
  onLongPress,
}: StatCardProps) {
  const content = (
    <Card.Column alignment="center" fullWidth spacing={4}>
      <Card.Label>{label}</Card.Label>
      {subtitle && <Card.Caption size={11}>{subtitle}</Card.Caption>}
      <Card.Metric value={value} unit={unit} valueSize={valueSize} />
    </Card.Column>
  )

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={450}>
      <Card variant="glass" minHeight={minHeight}>
        {content}
      </Card>
    </Pressable>
  )
}
