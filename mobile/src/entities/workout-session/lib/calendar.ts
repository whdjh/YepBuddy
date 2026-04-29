import { Alert, Linking } from "react-native"
import * as Calendar from "expo-calendar"
import i18n from "@/shared/i18n/i18n"
import { getWorkoutBodyPartSetLabel } from "../model/bodyPartSet"
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
    return i18n.t("workout.calendar.defaultTitle")
  }

  return bodyParts
    .map((item) => {
      const label = getWorkoutBodyPartSetLabel(item, {
        bodyPartLabel: (part) => i18n.t(BODY_PART_LABEL_KEYS[part]),
        bodyPartDetailLabel: (detail) =>
          i18n.t(`workout.bodyPartDetails.${detail}`),
      })
      return `${label}(${item.setCount})`
    })
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
      i18n.t("workout.calendar.permissionTitle"),
      i18n.t("workout.calendar.permissionBody"),
      [
        { text: i18n.t("common.cancel"), style: "cancel" },
        {
          text: i18n.t("workout.calendar.openSettings"),
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
    i18n.t("workout.calendar.successTitle"),
    i18n.t("workout.calendar.successBody"),
  )
  return true
}
