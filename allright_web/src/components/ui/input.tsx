import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // text & selection
        "text-left file:text-foreground placeholder:text-gray-500 text-gray-100",
        "selection:bg-[#16a34a] selection:text-white",
        // box
        "flex h-9 w-full min-w-0 rounded-md bg-transparent dark:bg-transparent px-3 py-1 text-base md:text-sm",
        "outline-none shadow-xs transition-colors",
        // visible border (base/hover/focus)
        "border border-white/15 hover:border-white/15",
        "focus-visible:border-[#16a34a] focus-visible:ring-[3px] focus-visible:ring-[rgba(22,163,74,0.35)]",
        // caret
        "caret-[#16a34a]",
        // invalid / disabled
        "aria-invalid:border-red-500 aria-invalid:ring-red-500/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // file input
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
