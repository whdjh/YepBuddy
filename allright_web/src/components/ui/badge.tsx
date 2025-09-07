import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * 토큰 의존 최소화:
 * - focus ring → white/30
 * - 기본/호버 컬러를 다크 배경(#191919) 친화 팔레트로 재정의
 * - default는 프로젝트 변수 --primary 사용
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 w-fit whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium shrink-0 overflow-hidden transition-colors outline-none " +
  "[&>svg]:size-3 [&>svg]:pointer-events-none " +
  "focus-visible:ring-[3px] focus-visible:ring-white/30 focus-visible:outline-1 focus-visible:border-white/20 " +
  "aria-invalid:ring-red-500/20 aria-invalid:border-red-500/60",
  {
    variants: {
      variant: {
        // 초록 기본 뱃지
        default:
          "border-transparent bg-[#16a34a] text-white [a&]:hover:brightness-110",
        // 중립(세컨더리)
        secondary:
          "border-white/10 bg-white/10 text-gray-100 [a&]:hover:bg-white/20",
        // 파괴적
        destructive:
          "border-transparent bg-red-500 text-white [a&]:hover:bg-red-600",
        // 테두리만
        outline:
          "border-white/15 bg-transparent text-gray-100 [a&]:hover:bg-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
