import { Text, View, useColorScheme } from "react-native"
import { useTranslation } from "react-i18next"
import { RingProgress } from "@/shared/ui/RingProgress"

type TempoStatus = "idle" | "contraction" | "relaxation" | "rest"

interface TempoRingDisplayProps {
  status: TempoStatus
  progress: number
  currentSet: number
  currentRep: number
  sets: number
}

export function TempoRingDisplay({
  status,
  progress,
  currentSet,
  currentRep,
  sets,
}: TempoRingDisplayProps) {
  const { t } = useTranslation()
  
  const isDark = useColorScheme() === "dark"

  const STATUS_LABELS: Record<TempoStatus, string> = {
    idle: t("tempo.waiting"),
    contraction: t("tempo.contraction"),
    relaxation: t("tempo.relaxation"),
    rest: t("tempo.rest"),
  }

  return (
    <>
      <Text className="text-yb-accent text-yb-body-md font-semibold text-center mb-yb-2">
        {STATUS_LABELS[status]}
      </Text>

      <View className="items-center mb-yb-3">
        <RingProgress
          size={160}
          strokeWidth={12}
          progress={progress}
          trackColor={isDark ? "#4A3A28" : "#EDE4D6"}
          fillColor={isDark ? "#D4883A" : "#9B7E56"}
        >
          <Text className="text-yb-fg text-yb-num-44">
            {currentSet}
          </Text>
          <Text className="text-yb-fg-secondary text-yb-caption">
            {`${currentSet} / ${sets} ${t("tempo.setsUnit")}`}
          </Text>
        </RingProgress>
      </View>

      <View className="flex-row justify-center gap-yb-8 mb-yb-4">
        <View className="items-center">
          <Text className="text-yb-fg-secondary text-yb-caption">
            {t("tempo.currentSet")}
          </Text>
          <Text className="text-yb-fg text-yb-body-lg font-bold">
            {currentSet > 0 ? currentSet : "—"}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-yb-fg-secondary text-yb-caption">
            {t("tempo.currentRep")}
          </Text>
          <Text className="text-yb-fg text-yb-body-lg font-bold">
            {currentRep > 0 ? currentRep : "—"}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-yb-fg-secondary text-yb-caption">
            {t("tempo.section")}
          </Text>
          <Text className="text-yb-fg text-yb-body-lg font-bold">
            {status !== "idle" ? STATUS_LABELS[status] : "—"}
          </Text>
        </View>
      </View>
    </>
  )
}
