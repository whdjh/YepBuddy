import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

type SiteHeaderProps = Pick<PageProps, "locale" | "text">

export function SiteHeader({ locale, text }: SiteHeaderProps) {
  const strings = text.header

  return (
    <header>
      <a href={pathWithLocale(locale, "/")}>{strings.home}</a>
      <nav>
        <a href={pathWithLocale(locale, "/privacy")}>{strings.privacy}</a>
        <a href={pathWithLocale(locale, "/support")}>{strings.support}</a>
      </nav>
    </header>
  )
}
