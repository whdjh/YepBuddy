import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

type SiteHeaderProps = Pick<PageProps, "locale" | "text">

export function SiteHeader({ locale, text }: SiteHeaderProps) {
  const strings = text.header

  return (
    <header className="sticky top-0 z-20 w-full bg-canvas/92 backdrop-blur-2xl">
      <div className="mx-auto flex min-h-header-mobile w-[calc(100%-2.25rem)] max-w-content items-center justify-between gap-4 phone:min-h-header phone:w-[calc(100%-3rem)]">
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
      </div>
    </header>
  )
}
