import { TextInput, type TextInputProps } from "react-native"
import { Host, TextField as SwiftTextField } from "@expo/ui/swift-ui"
import { frame, padding, glassEffect } from "@expo/ui/swift-ui/modifiers"

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

export function GlassTextarea({ placeholder, defaultValue, value, onChangeText, minHeight = 140 }: GlassTextareaProps) {
  return (
    <Host key={value ?? defaultValue} style={{ minHeight: minHeight + 20 }}>
      <SwiftTextField
        placeholder={placeholder}
        defaultValue={value ?? defaultValue}
        onChangeText={onChangeText}
        multiline
        numberOfLines={6}
        modifiers={[
          frame({ minHeight, alignment: "topLeading" }),
          padding({ all: 12 }),
          glassEffect({ glass: { variant: "regular" }, shape: "roundedRectangle", cornerRadius: 16 }),
        ]}
      />
    </Host>
  )
}
