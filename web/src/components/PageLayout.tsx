import type { ReactNode } from "react"
import { SiteHeader } from "./SiteHeader"
import type { PageProps } from "../types/landing"

type PageLayoutProps = Pick<PageProps, "locale" | "switchTo" | "text"> & {
  children: ReactNode
}

export function PageLayout({ locale, switchTo, text, children }: PageLayoutProps) {
  const switchLabel = locale === "ko" ? text.header.lang.en : text.header.lang.ko
  const switchAriaLabel =
    locale === "ko" ? text.header.lang.switchAriaToEn : text.header.lang.switchAriaToKo

  return (
    <>
      <SiteHeader locale={locale} text={text} />
      <main>{children}</main>
      <a
        href={switchTo}
        className="fixed right-4 z-100 inline-flex items-center justify-center min-w-58px min-h-42px px-14px rounded-full border border-(--yb-border) bg-(--yb-surface) text-(--yb-fg) no-underline text-[12px] font-bold tracking-[0.01em] hover:bg-(--yb-surface-subtle) focus-visible:outline-2 focus-visible:outline-(--yb-accent) focus-visible:outline-offset-2 bottom-[calc(16px+env(safe-area-inset-bottom))]"
        aria-label={switchAriaLabel}
      >
        {switchLabel}
      </a>
    </>
  )
}
