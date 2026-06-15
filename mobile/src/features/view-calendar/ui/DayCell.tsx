import { useRef, useState } from "react"
import { Dimensions, Modal, Pressable, Text, View } from "react-native"
import { useTranslation } from "react-i18next"
import type { BodyPart } from "@/entities/workout-session"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { BodyPartBadge } from "./BodyPartBadge"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface DayCellProps {
  day: number
  isToday: boolean
  hasWorkout: boolean
  isDeload: boolean
  bodyParts: BodyPart[]
  hasCardio: boolean
  disabled: boolean
  onPress: () => void
}

export function DayCell({
  day,
  isToday,
  hasWorkout,
  isDeload,
  bodyParts,
  hasCardio,
  disabled,
  onPress,
}: DayCellProps) {
  const { t } = useTranslation()
  const { accent } = useCardColors()
  const deloadLabel = t("workout.routineCycle.status.deload")
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [tooltipWidth, setTooltipWidth] = useState(0)
  const cellRef = useRef<View>(null)
  const visibleBodyPart = bodyParts[0] ?? null
  const hiddenBodyPartCount = Math.max(0, bodyParts.length - 1)
  const hiddenBadgeCount = hiddenBodyPartCount + (hasCardio ? 1 : 0)
  const badgeCount = bodyParts.length + (hasCardio ? 1 : 0)

  const handleLongPress = () => {
    if (badgeCount <= 1) return
    cellRef.current?.measure((_, __, width, ___, pageX, pageY) => {
      setTooltipPos({ x: pageX + width / 2, y: pageY })
      setTooltipVisible(true)
    })
  }

  const tooltipLeft = Math.max(
    8,
    Math.min(tooltipPos.x - tooltipWidth / 2, SCREEN_WIDTH - tooltipWidth - 8),
  )

  return (
    <>
      <Pressable
        ref={cellRef}
        style={{ width: "14.285%", minHeight: 68 }}
        className="items-center gap-yb-1 py-yb-1"
        onPress={onPress}
        onLongPress={handleLongPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Day ${day}${hasWorkout ? ", workout available" : ""}${isDeload ? `, ${deloadLabel}` : ""}`}
        accessibilityState={{ disabled }}
      >
        <View style={{ height: 24, alignItems: "center", justifyContent: "center" }}>
          {isToday ? (
            <View
              className="items-center justify-center rounded-full bg-yb-accent"
              style={{ width: 24, height: 24 }}
            >
              <Text className="text-yb-on-accent text-yb-label">{day}</Text>
            </View>
          ) : (
            <Text className="text-yb-fg-secondary text-yb-label">{day}</Text>
          )}
        </View>

        {hasWorkout && (
          <View className="flex-row items-center gap-yb-0.5">
            {visibleBodyPart ? (
              <BodyPartBadge bodyPart={visibleBodyPart} />
            ) : (
              !hasCardio && <BodyPartBadge bodyPart={null} />
            )}
            {hiddenBadgeCount > 0 && (
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: "700",
                  lineHeight: 12,
                  color: accent,
                }}
              >
                +{hiddenBadgeCount}
              </Text>
            )}
          </View>
        )}

        {hasWorkout && isDeload && (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no"
            className="mt-yb-0.5 h-yb-0.5 w-yb-5 rounded-full bg-yb-accent"
          />
        )}
      </Pressable>

      {tooltipVisible && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setTooltipVisible(false)}
        >
          <Pressable
            className="absolute inset-0"
            onPress={() => setTooltipVisible(false)}
          >
            <View
              className="absolute flex-row gap-yb-1.5 rounded-yb-sm bg-yb-surface p-yb-2 shadow-yb-md"
              style={{
                left: tooltipLeft,
                top: tooltipPos.y - 60,
                opacity: tooltipWidth === 0 ? 0 : 1,
              }}
              onLayout={(e) => setTooltipWidth(e.nativeEvent.layout.width)}
            >
              {bodyParts.map((part) => (
                <BodyPartBadge key={part} bodyPart={part} size="md" />
              ))}
              {hasCardio && <BodyPartBadge variant="cardio" size="md" />}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  )
}
