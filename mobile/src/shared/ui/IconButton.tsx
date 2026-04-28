import type { ReactNode } from "react"
import { Pressable, type PressableProps } from "react-native"
import { GlassBackground } from "./GlassBackground"

type IconButtonVariant = "back-square" | "back-round" | "adjust" | "glass" | "edit"

interface IconButtonProps extends Omit<PressableProps, "children"> {
  /** 아이콘 버튼 변형 */
  variant?: IconButtonVariant
  /** 아이콘 버튼 자식 요소 */
  children: ReactNode
}

const variantStyles: Record<IconButtonVariant, string> = {
  "back-square":
    "w-yb-icon-btn h-yb-icon-btn rounded-yb-icon bg-yb-surface-muted items-center justify-center active:opacity-80",
  "back-round":
    "w-yb-icon-btn h-yb-icon-btn rounded-full bg-yb-surface-muted items-center justify-center active:opacity-80",
  adjust:
    "w-yb-icon-btn h-yb-icon-btn rounded-yb-md bg-yb-fill-pale border border-yb-border items-center justify-center active:opacity-80",
  glass:
    "w-yb-icon-btn h-yb-icon-btn rounded-yb-icon items-center justify-center overflow-hidden active:scale-[0.95]",
  edit:
    "h-8 w-8 items-center justify-center rounded-full border border-yb-border bg-yb-surface opacity-95 active:opacity-70",
}

export function IconButton({ variant = "back-square", children, ...rest }: IconButtonProps) {
  return (
    <Pressable className={variantStyles[variant]} {...rest}>
      {variant === "glass" && <GlassBackground />}
      {children}
    </Pressable>
  )
}