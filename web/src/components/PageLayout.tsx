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
      <main className="mx-auto max-w-[760px] px-page-mobile pt-9 pb-20 phone:px-page phone:pt-12">
        {children}
      </main>
      <a
        href={switchTo}
        className="fixed right-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-30 inline-flex min-h-[42px] min-w-[58px] items-center justify-center rounded-full border border-line bg-canvas px-3.5 text-caption font-bold tracking-[0.01em] text-ink no-underline shadow-floating transition-colors duration-fast hover:bg-surface focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2"
        aria-label={switchAriaLabel}
      >
        {switchLabel}
      </a>
    </>
  )
}
