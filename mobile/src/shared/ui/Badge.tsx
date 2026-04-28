import { Text, View } from "react-native";

type BadgeLevel = "low" | "mid" | "high"

const badgeStyles: Record<BadgeLevel, { container: string; text: string }> = {
  low: {
    container: "bg-yb-status-success-bg",
    text:      "text-yb-status-success-text",
  },
  mid: {
    container: "bg-yb-status-info-bg",
    text:      "text-yb-status-info-text",
  },
  high: {
    container: "bg-yb-status-error-bg",
    text:      "text-yb-status-error-text",
  },
}

interface BadgeProps {
  /** 배지 레벨 */
  level: BadgeLevel
  /** 배지 라벨 */
  label: string
}

export function Badge({ level, label }: BadgeProps) {
  return (
    <View
      className={`h-[28px] justify-center px-yb-3 rounded-full ${badgeStyles[level].container}`}
    >
      <Text
        className={`text-yb-caption font-bold ${badgeStyles[level].text}`}
      >
        {label}
      </Text>
    </View>
  )
}