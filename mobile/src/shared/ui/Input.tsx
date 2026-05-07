import { TextInput, type TextInputProps } from "react-native"
import { useCardColors } from "@/shared/hooks/useCardColors"
import { GlassSurface } from "./GlassSurface"

/* Input */

type InputVariant = "default" | "glass"

interface InputProps extends TextInputProps {
  variant?: InputVariant
}

const INPUT_GLASS_RADIUS = 14

export function Input({ variant = "default", className, style, ...rest }: InputProps) {
  const { accent, fg, fgDisabled } = useCardColors()

  if (variant === "glass") {
    return (
      <GlassSurface
        className={className}
        cornerRadius={INPUT_GLASS_RADIUS}
        minHeight={48}
        paddingSize={0}
        fallbackClassName="bg-yb-surface/70"
      >
        <TextInput
          className="h-yb-input px-yb-4 text-yb-body-md"
          placeholderTextColor={fgDisabled}
          selectionColor={accent}
          style={[{ color: fg }, style]}
          {...rest}
        />
      </GlassSurface>
    )
  }

  return (
    <TextInput
      className={`h-yb-input rounded-yb-lg border-yb-input border-yb-border bg-yb-surface px-yb-4 text-yb-body-md text-yb-fg placeholder:text-yb-fg-disabled${className ? ` ${className}` : ""}`}
      placeholderTextColor={fgDisabled}
      style={style}
      {...rest}
    />
  )
}

/* Textarea */

type TextareaProps = TextInputProps

export function Textarea({ className, ...rest }: TextareaProps) {
  const { fgDisabled } = useCardColors()

  return (
    <TextInput
      className={`min-h-[160px] rounded-yb-lg border-yb-input border-yb-border bg-yb-surface p-yb-4 text-yb-body-md text-yb-fg placeholder:text-yb-fg-disabled${className ? ` ${className}` : ""}`}
      placeholderTextColor={fgDisabled}
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
        className="text-yb-body-md p-yb-3"
        style={{ minHeight, color: fg }}
      />
    </GlassSurface>
  )
}
