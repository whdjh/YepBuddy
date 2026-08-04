import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

type SiteHeaderProps = Pick<PageProps, "locale" | "switchTo" | "text">

export function SiteHeader({ locale, text, switchTo }: SiteHeaderProps) {
  const strings = text.header
  const switchLabel = locale === "ko" ? strings.lang.en : strings.lang.ko

  return (
    <header>
      <a href={pathWithLocale(locale, "/")}>{strings.home}</a>
      <nav>
        <a href={pathWithLocale(locale, "/privacy")}>{strings.privacy}</a>
        <a href={pathWithLocale(locale, "/support")}>{strings.support}</a>
        <a href={switchTo} aria-label={`${switchLabel}로 전환`}>
          {switchLabel}
        </a>
      </nav>
    </header>
  )
}
