import { StyleSheet, TextInput, type TextInputProps } from "react-native"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { GlassSurface } from "./GlassSurface"

/* Input */

type InputProps = TextInputProps

export function Input({ className, ...rest }: InputProps) {
  return (
    <TextInput
      className={`h-yb-input rounded-yb-lg border-[1.5px] border-yb-border bg-yb-surface px-yb-4 text-yb-body-md text-yb-fg placeholder:text-yb-fg-disabled${className ? ` ${className}` : ""}`}
      placeholderTextColor="var(--yb-fg-disabled)"
      {...rest}
    />
  )
}

/* Textarea */

type TextareaProps = TextInputProps

export function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <TextInput
      className={`min-h-[160px] rounded-yb-lg border-[1.5px] border-yb-border bg-yb-surface p-yb-4 text-yb-body-md text-yb-fg placeholder:text-yb-fg-disabled${className ? ` ${className}` : ""}`}
      placeholderTextColor="var(--yb-fg-disabled)"
      multiline
      textAlignVertical="top"
      {...rest}
    />
  )
}

/* GlassTextarea */

interface GlassTextareaProps {
  placeholder?: string
  defaultValue?: string
  value?: string
  onChangeText?: (value: string) => void
  minHeight?: number
}

const GLASS_TEXTAREA_RADIUS = 16

export function GlassTextarea({
  placeholder,
  defaultValue,
  value,
  onChangeText,
  minHeight = 140,
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
        placeholderTextColor={fgDisabled}
        selectionColor={accent}
        autoComplete="off"
        autoCorrect={false}
        spellCheck={false}
        textContentType="none"
        multiline
        textAlignVertical="top"
        style={[
          styles.glassTextareaInput,
          {
            minHeight,
            color: fg,
          },
        ]}
      />
    </GlassSurface>
  )
}

const styles = StyleSheet.create({
  glassTextareaInput: {
    fontSize: 15,
    padding: 12,
  },
})
