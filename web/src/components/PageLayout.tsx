import type { ReactNode } from "react"
import { SiteHeader } from "./SiteHeader"
import type { PageProps } from "../types/landing"

type PageLayoutProps = Pick<PageProps, "locale" | "switchTo" | "text"> & {
  children: ReactNode
}

export function PageLayout({ locale, switchTo, text, children }: PageLayoutProps) {
  return (
    <div className="lp-page">
      <SiteHeader locale={locale} text={text} switchTo={switchTo} />
      <main>{children}</main>
    </div>
  )
}
