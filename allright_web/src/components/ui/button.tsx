import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * - 토큰 의존 제거 (bg-primary, ring-ring 등)
 * - 기본(primary)은 프로젝트 변수 `--primary`를 직접 사용
 * - 나머지는 중립 색(white/gray)과 red 계열만 사용
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 " +
  "outline-none focus-visible:ring-[3px] focus-visible:ring-white/30 focus-visible:outline-1 " +
  "focus-visible:border-white/30 aria-invalid:ring-red-500/20 aria-invalid:border-red-500/60 shrink-0",
  {
    variants: {
      variant: {
        /** 보라 기본 버튼(프로젝트 변수 사용) */
        default:
          "bg-[#16a34a] text-white shadow-xs hover:brightness-110 active:brightness-95",

        /** 파괴적 액션 */
        destructive:
          "bg-red-500 text-white shadow-xs hover:bg-red-600 focus-visible:ring-red-400/30",

        /** 외곽선 스타일(투명 배경) */
        outline:
          "border border-white/15 bg-transparent text-gray-100 shadow-xs hover:bg-white/10",

        /** 보조 버튼(중립 배경) */
        secondary:
          "bg-white/10 text-gray-100 shadow-xs hover:bg-white/20",

        /** 고스트(배경 없음, 호버만) */
        ghost:
          "bg-transparent text-gray-200 hover:bg-white/10 hover:text-white",

        /** 링크 스타일(기본 색상 링크) */
        link:
          "text-[#16a34a] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
