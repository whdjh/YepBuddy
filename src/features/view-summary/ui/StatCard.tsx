import { Card } from "@/shared/ui/Card"

interface StatCardProps {
  label: string
  subtitle: string
  value: number | string
  unit: string
}

export function StatCard({ label, subtitle, value, unit }: StatCardProps) {
  return (
    <Card variant="glass" minHeight={120}>
      <Card.Column alignment="leading">
        <Card.Label>{label}</Card.Label>
        <Card.Caption size={11}>{subtitle}</Card.Caption>
        <Card.Metric value={value} unit={unit} />
      </Card.Column>
    </Card>
  )
}