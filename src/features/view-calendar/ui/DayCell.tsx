import { useRef, useState } from "react"
import { Dimensions, Modal, Pressable, Text, View } from "react-native"
import type { BodyPart } from "@/entities/workout-session"
import { BodyPartBadge } from "./BodyPartBadge"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

interface DayCellProps {
  day: number
  isToday: boolean
  hasWorkout: boolean
  bodyParts: BodyPart[]
  disabled: boolean
  onPress: () => void
}

export function DayCell({ day, isToday, hasWorkout, bodyParts, disabled, onPress }: DayCellProps) {
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [tooltipWidth, setTooltipWidth] = useState(0)
  const cellRef = useRef<View>(null)

  const handleLongPress = () => {
    if (bodyParts.length <= 1) return
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
            <BodyPartBadge bodyPart={bodyParts[0] ?? null} />
            {bodyParts.length > 1 && (
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: "700",
                  lineHeight: 12,
                  color: "#9B7E56",
                }}
              >
                +{bodyParts.length - 1}
              </Text>
            )}
          </View>
        )}
      </Pressable>

      {tooltipVisible && (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setTooltipVisible(false)}
        >
          <Pressable
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={() => setTooltipVisible(false)}
          >
            <View
              className="flex-row rounded-yb-sm bg-yb-surface"
              style={{
                position: "absolute",
                left: tooltipLeft,
                top: tooltipPos.y - 60,
                gap: 6,
                padding: 8,
                opacity: tooltipWidth === 0 ? 0 : 1,
                shadowColor: "#3A2A1A",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 8,
              }}
              onLayout={(e) => setTooltipWidth(e.nativeEvent.layout.width)}
            >
              {bodyParts.map((part) => (
                <BodyPartBadge key={part} bodyPart={part} size="md" />
              ))}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  )
}
