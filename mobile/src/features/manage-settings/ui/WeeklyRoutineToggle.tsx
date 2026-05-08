import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Pressable, Switch, Text, View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { useWeeklyRoutinePlan } from "@/features/view-summary/model/useWeeklyRoutinePlan"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"
import { SettingsRow } from "./SettingsRow"
import { WeeklyRoutineSettingsSheet } from "./WeeklyRoutineSettingsSheet"

export function WeeklyRoutineToggle() {
  const { t } = useTranslation()
  const { routineSetup } = useLocalSearchParams<{ routineSetup?: string }>()
  const plan = useWeeklyRoutinePlan()
  const accent = useResolvedColorToken(semanticColorTokens.accent)
  const muted = useResolvedColorToken(semanticColorTokens.surfaceMuted)
  const surface = useResolvedColorToken(semanticColorTokens.surface)

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const shouldDisableOnSheetCloseRef = useRef(false)
  const didOpenRoutineSetupRef = useRef(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (
      routineSetup === "1" &&
      !plan.isLoading &&
      !didOpenRoutineSetupRef.current
    ) {
      didOpenRoutineSetupRef.current = true
      shouldDisableOnSheetCloseRef.current = !plan.hasCustomSettings
      setIsSheetOpen(true)
    }
  }, [plan.hasCustomSettings, plan.isLoading, routineSetup])

  const handleToggle = async () => {
    if (updating || plan.isLoading) {
      return
    }

    setUpdating(true)

    try {
      if (plan.isRoutineEnabled) {
        await plan.disableRoutine()
        return
      }

      await plan.enableRoutine()
      if (!plan.hasCustomSettings) {
        shouldDisableOnSheetCloseRef.current = true
        setIsSheetOpen(true)
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleOpenDetail = () => {
    shouldDisableOnSheetCloseRef.current = !plan.hasCustomSettings
    setIsSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setIsSheetOpen(false)

    if (shouldDisableOnSheetCloseRef.current) {
      shouldDisableOnSheetCloseRef.current = false
      void plan.disableRoutine()
    }
  }

  return (
    <>
      <SettingsRow
        title={t("settings.weeklyRoutine.title")}
        body={t("settings.weeklyRoutine.body")}
        control={
          <View className="items-end gap-yb-2">
            {plan.isLoading ? (
              <ActivityIndicator color={accent} />
            ) : (
              <Switch
                value={plan.isRoutineEnabled}
                disabled={updating}
                onValueChange={() => {
                  void handleToggle()
                }}
                trackColor={{ false: muted, true: accent }}
                thumbColor={surface}
              />
            )}
            {plan.isRoutineEnabled && (
              <Pressable
                className="min-h-[32px] justify-center rounded-yb-md bg-yb-fill-pale px-yb-3 active:opacity-80"
                onPress={handleOpenDetail}
              >
                <Text className="text-yb-caption font-semibold text-yb-fg-secondary">
                  {t("settings.weeklyRoutine.detail")}
                </Text>
              </Pressable>
            )}
          </View>
        }
      />
      <WeeklyRoutineSettingsSheet
        plan={plan}
        visible={isSheetOpen}
        onClose={handleCloseSheet}
        onSaved={() => {
          shouldDisableOnSheetCloseRef.current = false
        }}
      />
    </>
  )
}
