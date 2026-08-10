import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

type SiteHeaderProps = Pick<PageProps, "locale" | "text">

export function SiteHeader({ locale, text }: SiteHeaderProps) {
  const strings = text.header

  return (
    <header className="sticky top-0 z-20 mx-auto flex min-h-header-mobile w-full max-w-content items-center justify-between gap-4 bg-canvas/92 px-page-mobile backdrop-blur-2xl phone:min-h-header phone:px-page">
      <a
        className="text-lg font-heavy tracking-[-0.035em] text-ink no-underline"
        href={pathWithLocale(locale, "/")}
      >
        {strings.home}
      </a>
      <nav className="flex gap-4 text-sm font-semibold">
        <a
          className="text-ink-secondary underline-offset-4 transition-colors duration-fast hover:text-ink"
          href={pathWithLocale(locale, "/privacy")}
        >
          {strings.privacy}
        </a>
        <a
          className="text-ink-secondary underline-offset-4 transition-colors duration-fast hover:text-ink"
          href={pathWithLocale(locale, "/support")}
        >
          {strings.support}
        </a>
      </nav>
    </header>
  )
}
