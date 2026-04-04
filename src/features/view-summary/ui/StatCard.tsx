import { Text, View } from "react-native"
import { Card } from "@/shared/ui/Card"

interface StatCardProps {
  label: string
  subtitle: string
  value: number | string
  unit: string
}

export function StatCard({ label, subtitle, value, unit }: StatCardProps) {
  return (
    <Card variant="glass">
      <Text className="text-yb-fg-secondary text-yb-label">{label}</Text>
      <Text className="text-yb-fg text-yb-caption mt-yb-0.5">{subtitle}</Text>
      <View className="flex-row items-baseline mt-yb-3">
        <Text className="text-yb-accent text-yb-num-md">{value}</Text>
        <Text className="text-yb-fg-secondary text-yb-body-sm font-medium ml-yb-0.5">{unit}</Text>
      </View>
    </Card>
  )
}
