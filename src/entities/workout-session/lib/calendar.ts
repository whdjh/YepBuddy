import { Alert, Linking } from "react-native"
import * as Calendar from "expo-calendar"
import { t } from "i18next"
import type { WorkoutBodyPartSet } from "../model/types"

const BODY_PART_LABEL_KEYS: Record<WorkoutBodyPartSet["part"], string> = {
  chest: "workout.bodyParts.chest",
  back: "workout.bodyParts.back",
  legs: "workout.bodyParts.legs",
  shoulders: "workout.bodyParts.shoulders",
  arms: "workout.bodyParts.arms",
  core: "workout.bodyParts.core",
}

/** 운동 부위와 세트 수를 묶어 캘린더 이벤트 제목 문자열로 만든다. */
function formatWorkoutCalendarTitle(bodyParts: WorkoutBodyPartSet[]) {
  if (bodyParts.length === 0) {
    return t("workout.calendar.defaultTitle")
  }

  return bodyParts
    .map(({ part, setCount }) => `${t(BODY_PART_LABEL_KEYS[part])}(${setCount})`)
    .join(", ")
}

/** 완료된 운동 세션을 기기 캘린더 이벤트로 등록한다. */
export async function registerWorkoutToCalendar(params: {
  startedAt: string
  completedAt: string
  memo: string
  bodyParts: WorkoutBodyPartSet[]
}) {
  const permission = await Calendar.getCalendarPermissionsAsync()
  let status = permission.status

  if (status !== "granted") {
    const requested = await Calendar.requestCalendarPermissionsAsync()
    status = requested.status
  }

  if (status !== "granted") {
    Alert.alert(
      t("workout.calendar.permissionTitle"),
      t("workout.calendar.permissionBody"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("workout.calendar.openSettings"),
          onPress: () => void Linking.openSettings(),
        },
      ],
    )
    return false
  }

  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  )
  const editableCalendar =
    calendars.find((calendar) => calendar.allowsModifications) ?? calendars[0]

  if (!editableCalendar) {
    return false
  }

  await Calendar.createEventAsync(editableCalendar.id, {
    title: formatWorkoutCalendarTitle(params.bodyParts),
    startDate: new Date(params.startedAt),
    endDate: new Date(params.completedAt),
    notes: params.memo || undefined,
  })

  Alert.alert(
    t("workout.calendar.successTitle"),
    t("workout.calendar.successBody"),
  )
  return true
}
