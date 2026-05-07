import { Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import { RingProgress } from "@/shared/ui/RingProgress"

type TempoStatus = "idle" | "countdown" | "contraction" | "relaxation" | "rest" | "count"

interface TempoRingDisplayProps {
  status: TempoStatus
  progress: number
  currentSet: number
  currentRep: number
  sets: number
  countdownRemaining?: number | null
}

export function TempoRingDisplay({
  status,
  progress,
  currentSet,
  currentRep,
  sets,
  countdownRemaining,
}: TempoRingDisplayProps) {
  const { t } = useTranslation()

  const STATUS_LABELS: Record<TempoStatus, string> = {
    idle: t("tempo.waiting"),
    countdown: t("tempo.preparing"),
    contraction: t("tempo.contraction"),
    relaxation: t("tempo.relaxation"),
    rest: t("tempo.rest"),
    count: t("tempo.count"),
  }

  const isCountdown = status === "countdown"

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
        >
          {isCountdown ? (
            <Text className="text-yb-fg text-yb-num-44">
              {countdownRemaining ?? 0}
            </Text>
          ) : (
            <>
              <Text className="text-yb-fg text-yb-num-44">
                {currentSet}
              </Text>
              <Text className="text-yb-fg-secondary text-yb-caption">
                {`${currentSet} / ${sets} ${t("tempo.setsUnit")}`}
              </Text>
            </>
          )}
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
