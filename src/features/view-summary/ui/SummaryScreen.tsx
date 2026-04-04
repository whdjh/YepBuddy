import { ScrollView, Text, View } from "react-native"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import { Main } from "@/shared/ui/Main"
import { Button } from "@/shared/ui/Button"
import { TodayWorkoutCard } from "./TodayWorkoutCard"
import { StatCard } from "./StatCard"
import { SessionLinkCard } from "./SessionLinkCard"
import { WorkoutLinkCard } from "./WorkoutLinkCard"
import { WeeklySessionList } from "./WeeklySessionList"

const MOCK_WEEKLY_SESSIONS = [
  { bodyPart: "가슴", day: "일요일", durationMin: 43, sets: 18, kcal: 262 },
  { bodyPart: "등", day: "토요일", durationMin: 51, sets: 20, kcal: 279 },
  { bodyPart: "하체", day: "금요일", durationMin: 38, sets: 16, kcal: 232 },
  { bodyPart: "어깨", day: "목요일", durationMin: 35, sets: 15, kcal: 210 },
]

export function SummaryScreen() {
  const router = useRouter()
  const { t } = useTranslation()

  const todayDate = new Date()
  const dateString = `${todayDate.getMonth() + 1}월 ${todayDate.getDate()}일 ${
    ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"][todayDate.getDay()]
  }`

  return (
    <Main>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-yb-5 pb-[120px]"
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View className="pt-yb-4 pb-yb-1">
          <Text className="text-yb-fg text-yb-display tracking-yb-tight">{t("summary.title")}</Text>
        </View>
        <Text className="text-yb-fg-secondary text-yb-label mb-yb-6">{dateString}</Text>

        {/* 오늘의 운동 카드 */}
        <View className="mb-yb-4">
          <TodayWorkoutCard bodyParts="가슴" totalSets={18} targetSets={24} />
        </View>

        {/* 운동시간 / 세트수 */}
        <View className="flex-row gap-yb-4 mb-yb-4">
          <View className="flex-1">
            <StatCard
              label={t("summary.workoutTime")}
              subtitle={t("summary.today")}
              value={43}
              unit={t("summary.minuteUnit")}
            />
          </View>
          <View className="flex-1">
            <StatCard
              label={t("summary.sets")}
              subtitle={t("summary.today")}
              value={18}
              unit={t("summary.setsUnit")}
            />
          </View>
        </View>

        {/* 세션 카드 / 운동 카드 */}
        <View className="flex-row gap-yb-4 mb-yb-4">
          <View className="flex-1">
            <SessionLinkCard bodyPart="가슴" kcal={262} day="토요일" />
          </View>
          <View className="flex-1">
            <WorkoutLinkCard />
          </View>
        </View>

        {/* 이번 주 세션 */}
        <View className="mb-yb-6">
          <WeeklySessionList sessions={MOCK_WEEKLY_SESSIONS} onMorePress={() => router.push("/sessions")} />
        </View>

        {/* 하단 버튼 */}
        <View className="pt-yb-6 gap-yb-3">
          <Button variant="glass" label={t("summary.editSummary")} onPress={() => {}} />
          <Button variant="glass" label={t("summary.allCategories")} onPress={() => {}} />
        </View>
      </ScrollView>
    </Main>
  )
}
