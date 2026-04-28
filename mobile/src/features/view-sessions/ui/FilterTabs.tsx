import { ScrollView, View } from "react-native"
import { useTranslation } from "react-i18next"
import { bodyPartLabel } from "@/shared/lib/format"
import { FilterPill } from "@/shared/ui/Chip"
import type { SessionFilterValue } from "../model/types"

const BODY_PART_KEYS = [
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
] as const

interface FilterTabsProps {
  value: SessionFilterValue
  onChange: (nextValue: SessionFilterValue) => void
}

export function FilterTabs({ value, onChange }: FilterTabsProps) {
  const { t } = useTranslation()

  return (
    <View className="pt-yb-2 pb-yb-1">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-yb-5 gap-yb-2"
      >
        <FilterPill
          label={t("sessions.filterAll")}
          variant={value === "all" ? "active" : "default"}
          onPress={() => onChange("all")}
        />
        {BODY_PART_KEYS.map((key) => (
          <FilterPill
            key={key}
            label={bodyPartLabel(key)}
            variant={value === key ? "active" : "default"}
            onPress={() => onChange(key)}
          />
        ))}
      </ScrollView>
    </View>
  )
}
