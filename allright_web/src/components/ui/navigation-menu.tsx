// src/components/ui/navigation-menu.tsx
"use client"

import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * NOTE
 * - shadcn 토큰(bg-background, accent, popover, ring 등) 제거
 * - 다크 헤더(#191919)에서 잘 보이는 중립 색상으로 치환
 * - hover/focus/active는 white 계열 alpha로 처리
 */

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

/** 트리거(상단 탭 버튼) — 토큰 제거 버전 */
const navigationMenuTriggerStyle = cva(
  [
    "group inline-flex h-9 w-max items-center justify-center rounded-md",
    "px-4 py-2 text-sm font-medium",
    "text-gray-200 bg-transparent",
    // hover / focus / open
    "hover:bg-white/10 hover:text-white",
    "focus:bg-white/10 focus:text-white",
    "data-[state=open]:bg-white/15 data-[state=open]:text-white",
    "disabled:pointer-events-none disabled:opacity-50",
    "outline-none transition-[color,background-color,box-shadow]",
    "focus-visible:ring-[3px] focus-visible:ring-white/30 focus-visible:outline-1",
  ].join(" ")
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

/** 드롭다운 패널 — 토큰 제거 + 중립색/테두리로 교체 */
function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        // 애니메이션 유지
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",
        "top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        // viewport=false 일 때 패널 스타일
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden",
        "group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow-md group-data-[viewport=false]/navigation-menu:duration-200",
        "group-data-[viewport=false]/navigation-menu:bg-[#222] group-data-[viewport=false]/navigation-menu:text-gray-100 group-data-[viewport=false]/navigation-menu:border-white/10",
        // link 포커스 링 정리
        "**:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

/** 뷰포트 컨테이너 — 토큰 제거 */
function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 isolate z-50 flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center relative mt-1.5",
          "h-[var(--radix-navigation-menu-viewport-height)] w-full md:w-[var(--radix-navigation-menu-viewport-width)]",
          "overflow-hidden rounded-md border border-white/10 shadow-md",
          "bg-[#222] text-gray-100",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",
          className
        )}
        {...props}
      />
    </div>
  )
}

/** 링크 — 토큰 제거 + hover/active 중립색 */
function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm transition-colors outline-none",
        "text-gray-300 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white",
        "focus-visible:ring-[3px] focus-visible:ring-white/30 focus-visible:outline-1",
        "data-[active=true]:bg-white/10 data-[active=true]:text-white",
        "[&_svg:not([class*='text-'])]:text-gray-400 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/** 아래쪽 작은 다이아몬드 인디케이터 — 중립색 */
function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-white/20 shadow-md border border-white/10" />
    </NavigationMenuPrimitive.Indicator>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
