import { TextInput } from "react-native"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { GlassSurface } from "./GlassSurface"

interface GlassTextareaProps {
  placeholder?: string
  defaultValue?: string
  value?: string
  onChangeText?: (value: string) => void
  minHeight?: number
  editable?: boolean
}

const GLASS_TEXTAREA_RADIUS = 16

export function GlassTextarea({
  placeholder,
  defaultValue,
  value,
  onChangeText,
  minHeight = 140,
  editable = true,
}: GlassTextareaProps) {
  const { accent, fg, fgDisabled } = useCardColors()

  return (
    <GlassSurface
      cornerRadius={GLASS_TEXTAREA_RADIUS}
      minHeight={minHeight + 20}
      paddingSize={0}
      fallbackClassName="bg-yb-surface/70"
    >
      <TextInput
        placeholder={placeholder}
        defaultValue={value == null ? defaultValue : undefined}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholderTextColor={fgDisabled}
        selectionColor={accent}
        autoComplete="off"
        autoCorrect={false}
        spellCheck={false}
        textContentType="none"
        multiline
        textAlignVertical="top"
        className="text-yb-body-md p-yb-3"
        style={{ minHeight, color: fg }}
      />
    </GlassSurface>
  )
}
