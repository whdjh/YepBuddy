"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

type Tone = "primary" | "violet" | "green" | "sky" | "rose" | "amber"

function toneClasses(tone: Tone) {
  switch (tone) {
    case "violet":
      return {
        selectedSingle:
          "data-[selected-single=true]:bg-violet-600 data-[selected-single=true]:text-white dark:data-[selected-single=true]:bg-violet-500",
        rangeStart:
          "data-[range-start=true]:bg-violet-600 data-[range-start=true]:text-white",
        rangeEnd:
          "data-[range-end=true]:bg-violet-600 data-[range-end=true]:text-white",
        rangeMiddle:
          "data-[range-middle=true]:bg-violet-100 data-[range-middle=true]:text-violet-900 dark:data-[range-middle=true]:bg-violet-900/40 dark:data-[range-middle=true]:text-violet-50",
        focusRing:
          "group-data-[focused=true]/day:ring-violet-500/50 group-data-[focused=true]/day:border-violet-500",
        today: "outline outline-2 outline-violet-500/40",
        hover: "hover:bg-violet-50 dark:hover:bg-violet-900/20",
      }
    case "green":
      return {
        selectedSingle:
          "data-[selected-single=true]:bg-[#16a34a] data-[selected-single=true]:text-white",
        rangeStart:
          "data-[range-start=true]:bg-[#16a34a] data-[range-start=true]:text-white",
        rangeEnd:
          "data-[range-end=true]:bg-[#16a34a] data-[range-end=true]:text-white",
        rangeMiddle:
          "data-[range-middle=true]:bg-[#16a34a]/15 data-[range-middle=true]:text-[#16a34a] " +
          "dark:data-[range-middle=true]:bg-[#16a34a]/30 dark:data-[range-middle=true]:text-white",
        focusRing:
          "group-data-[focused=true]/day:ring-[#16a34a]/50 group-data-[focused=true]/day:border-[#16a34a]",
        today: "outline outline-2 outline-[#16a34a]/40",
        hover: "hover:bg-[#16a34a]/10 dark:hover:bg-[#16a34a]/20",
      }
    case "sky":
      return {
        selectedSingle:
          "data-[selected-single=true]:bg-sky-600 data-[selected-single=true]:text-white dark:data-[selected-single=true]:bg-sky-500",
        rangeStart:
          "data-[range-start=true]:bg-sky-600 data-[range-start=true]:text-white",
        rangeEnd:
          "data-[range-end=true]:bg-sky-600 data-[range-end=true]:text-white",
        rangeMiddle:
          "data-[range-middle=true]:bg-sky-100 data-[range-middle=true]:text-sky-900 dark:data-[range-middle=true]:bg-sky-900/40 dark:data-[range-middle=true]:text-sky-50",
        focusRing:
          "group-data-[focused=true]/day:ring-sky-500/50 group-data-[focused=true]/day:border-sky-500",
        today: "outline outline-2 outline-sky-500/40",
        hover: "hover:bg-sky-50 dark:hover:bg-sky-900/20",
      }
    case "rose":
      return {
        selectedSingle:
          "data-[selected-single=true]:bg-rose-600 data-[selected-single=true]:text-white dark:data-[selected-single=true]:bg-rose-500",
        rangeStart:
          "data-[range-start=true]:bg-rose-600 data-[range-start=true]:text-white",
        rangeEnd:
          "data-[range-end=true]:bg-rose-600 data-[range-end=true]:text-white",
        rangeMiddle:
          "data-[range-middle=true]:bg-rose-100 data-[range-middle=true]:text-rose-900 dark:data-[range-middle=true]:bg-rose-900/40 dark:data-[range-middle=true]:text-rose-50",
        focusRing:
          "group-data-[focused=true]/day:ring-rose-500/50 group-data-[focused=true]/day:border-rose-500",
        today: "outline outline-2 outline-rose-500/40",
        hover: "hover:bg-rose-50 dark:hover:bg-rose-900/20",
      }
    case "amber":
      return {
        selectedSingle:
          "data-[selected-single=true]:bg-amber-600 data-[selected-single=true]:text-white dark:data-[selected-single=true]:bg-amber-500",
        rangeStart:
          "data-[range-start=true]:bg-amber-600 data-[range-start=true]:text-white",
        rangeEnd:
          "data-[range-end=true]:bg-amber-600 data-[range-end=true]:text-white",
        rangeMiddle:
          "data-[range-middle=true]:bg-amber-100 data-[range-middle=true]:text-amber-900 dark:data-[range-middle=true]:bg-amber-900/40 dark:data-[range-middle=true]:text-amber-50",
        focusRing:
          "group-data-[focused=true]/day:ring-amber-500/50 group-data-[focused=true]/day:border-amber-500",
        today: "outline outline-2 outline-amber-500/40",
        hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20",
      }
    default: // primary 토큰 사용
      return {
        selectedSingle:
          "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        rangeStart:
          "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        rangeEnd:
          "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        rangeMiddle:
          "data-[range-middle=true]:bg-white/10 data-[range-middle=true]:text-white/10-foreground",
        focusRing:
          "group-data-[focused=true]/day:ring-ring/50 group-data-[focused=true]/day:border-ring",
        today: "outline outline-2 outline-ring/40",
        hover: "hover:bg-white/60 dark:hover:bg-white/40",
      }
  }
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  tone = "primary",
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  tone?: Tone
}) {
  const defaultClassNames = getDefaultClassNames()
  const t = toneClasses(tone)

  // DayButton에 tone을 주입하는 래퍼
  const ToneDayButton = (btnProps: React.ComponentProps<typeof DayButton>) => (
    <CalendarDayButton {...btnProps} tone={tone} />
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        // 배경색은 DayButton에서 상태별로 통일 적용
        range_start: cn("rounded-l-md", defaultClassNames.range_start),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md", defaultClassNames.range_end),
        today: cn(
          "rounded-md data-[selected=true]:rounded-none", // today 강조는 DayButton에서 outline로
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ToneDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  tone = "primary",
  ...props
}: React.ComponentProps<typeof DayButton> & { tone?: Tone }) {
  const defaultClassNames = getDefaultClassNames()
  const t = toneClasses(tone)

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      // today 강조: outline 색상
      className={cn(
        "flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal",
        // hover
        t.hover,
        // 포커스 링
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px]",
        t.focusRing,
        // 선택 상태
        "data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md",
        t.selectedSingle,
        t.rangeStart,
        t.rangeEnd,
        t.rangeMiddle,
        // 오늘
        modifiers.today && t.today,
        // 기존 기본 클래스
        "[&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
