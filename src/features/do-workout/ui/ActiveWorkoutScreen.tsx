import { useState } from "react"
import { ScrollView, View, useColorScheme } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { StatsSection } from "./StatsSection"
import { BodyPartSelector } from "./BodyPartSelector"
import { SetCountList } from "./SetCountList"
import { MemoSection } from "./MemoSection"
import { WorkoutDrawer, BUTTONS_HEIGHT } from "./WorkoutDrawer"

// Mock data
const heartRate = 69
const activeKcal = 0
const totalKcal = 0
const timerDisplay = "00:32.52"

export function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === "dark"

  const [selectedParts, setSelectedParts] = useState<Record<string, number>>({})
  const [memo, setMemo] = useState("")
  const [isPaused, setIsPaused] = useState(false)

  const bottomPadding = Math.max(insets.bottom, 24)

  const togglePart = (key: string) => {
    setSelectedParts((prev) => {
      const next = { ...prev }
      if (key in next) {
        delete next[key]
      } else {
        next[key] = 10
      }
      return next
    })
  }

  const updateSets = (key: string, value: number) => {
    setSelectedParts((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <View className={`h-full w-full bg-yb-bg${isDark ? " workout-mode" : ""}`}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 84 + BUTTONS_HEIGHT + bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
      >
        <StatsSection
          heartRate={heartRate}
          activeKcal={activeKcal}
          totalKcal={totalKcal}
        />
        <BodyPartSelector
          selectedParts={selectedParts}
          onToggle={togglePart}
        />
        <SetCountList
          selectedParts={selectedParts}
          onUpdate={updateSets}
        />
        <MemoSection
          value={memo}
          onChangeText={setMemo}
        />
      </ScrollView>

      <WorkoutDrawer
        timerDisplay={timerDisplay}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((v) => !v)}
        bottomPadding={bottomPadding}
      />
    </View>
  )
}
