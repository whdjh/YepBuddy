import { Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { useUnstableNativeVariable } from "nativewind"
import { SymbolView } from "expo-symbols"
import { Card } from "@/shared/ui/Card"

interface SessionData {
  bodyPart: string
  day: string
  durationMin: number
  sets: number
  kcal: number
}

interface WeeklySessionListProps {
  sessions: SessionData[]
  onMorePress?: () => void
}

export function WeeklySessionList({ sessions, onMorePress }: WeeklySessionListProps) {
  const { t } = useTranslation()

  const accentColor = (useUnstableNativeVariable("--yb-accent") as unknown as string) || "#9B7E56"

  return (
    <Card variant="glass">
      <View className="flex-row items-center justify-between mb-yb-4">
        <Text className="text-yb-fg-secondary text-yb-label">{t("summary.thisWeekSessions")}</Text>
        <Pressable onPress={onMorePress} hitSlop={8} className="flex-row items-center gap-yb-1">
          <Text className="text-yb-fg-secondary text-yb-label">{t("summary.moreLink")}</Text>
          <SymbolView name="chevron.right" size={12} tintColor={accentColor} />
        </Pressable>
      </View>
      {sessions.map((session, index) => (
        <View key={`${session.bodyPart}-${session.day}`}>
          {index > 0 && <View className="h-[1px] bg-yb-border-subtle" />}
          <View className="flex-row items-center gap-yb-3 py-yb-2.5 min-h-yb-touch">
            <View className="w-yb-icon-sm h-yb-touch rounded-yb-md bg-yb-fill-pale items-center justify-center shrink-0">
              <SymbolView name="dumbbell.fill" size={18} tintColor={accentColor} />
            </View>
            <View className="shrink">
              <Text className="text-yb-fg text-yb-body-md font-semibold">{session.bodyPart}</Text>
              <View className="flex-row items-center gap-yb-1 mt-yb-0.5">
                <Text className="text-yb-fg-secondary text-yb-label">{session.day}</Text>
                <SymbolView name="circle.fill" size={4} tintColor={accentColor} />
                <Text className="text-yb-fg-secondary text-yb-label">{session.durationMin}{t("summary.minuteUnit")}</Text>
                <SymbolView name="circle.fill" size={4} tintColor={accentColor} />
                <Text className="text-yb-fg-secondary text-yb-label">{session.sets}{t("summary.setsUnit")}</Text>
              </View>
            </View>
            <View className="items-end ml-auto">
              <Text className="text-yb-accent text-yb-body-md font-bold">{session.kcal}</Text>
              <Text className="text-yb-fg-secondary text-yb-caption">{t("summary.kcalUnit")}</Text>
            </View>
          </View>
        </View>
      ))}
    </Card>
  )
}
