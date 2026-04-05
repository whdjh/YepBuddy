import { Pressable, Text, View } from "react-native"
import { DayRing } from "./DayRing"

interface DayCellProps {
  day: number
  isToday: boolean
  hasWorkout: boolean
  disabled: boolean
  trackColor: string
  fillColor: string
  successColor: string
  onPress: () => void
}

export function DayCell({
  day,
  isToday,
  hasWorkout,
  disabled,
  trackColor,
  fillColor,
  successColor,
  onPress,
}: DayCellProps) {
  return (
    <Pressable
      style={{ width: "14.285%", minHeight: 68 }}
      className="items-center gap-yb-1 py-yb-1"
      onPress={onPress}
      disabled={disabled}
    >
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

      <View>
        <DayRing
          hasWorkout={hasWorkout}
          trackColor={trackColor}
          fillColor={fillColor}
        />
        {hasWorkout && (
          <View
            className="absolute rounded-full"
            style={{
              width: 5,
              height: 5,
              backgroundColor: successColor,
              top: -1,
              right: -1,
            }}
          />
        )}
      </View>
    </Pressable>
  )
}
