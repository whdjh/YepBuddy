import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // base
        "flex field-sizing-content min-h-16 w-full rounded-md px-3 py-2 text-base md:text-sm outline-none transition-colors shadow-xs",
        // colors
        "bg-transparent text-gray-100 placeholder:text-gray-500",
        "border border-white/15",
        // focus: 초록(브랜드)로 강조
        "focus-visible:border-[#16a34a]",
        "focus-visible:ring-[3px] focus-visible:ring-[color:#16a34a/0.35]",
        "caret-[#16a34a]",
        // invalid / disabled
        "aria-invalid:border-red-500/60 aria-invalid:ring-red-500/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
