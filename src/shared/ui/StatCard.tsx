import { Card } from "./Card"

interface StatCardProps {
  label: string
  subtitle?: string
  value: number | string
  unit: string
  minHeight?: number
  valueSize?: number
}

export function StatCard({ label, subtitle, value, unit, minHeight = 120, valueSize }: StatCardProps) {
  return (
    <Card variant="glass" minHeight={minHeight}>
      <Card.Column alignment="leading" spacing={4}>
        <Card.Label>{label}</Card.Label>
        {subtitle && <Card.Caption size={11}>{subtitle}</Card.Caption>}
        <Card.Metric value={value} unit={unit} valueSize={valueSize} />
      </Card.Column>
    </Card>
  )
}
