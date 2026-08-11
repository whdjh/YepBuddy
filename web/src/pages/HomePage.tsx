import { PageLayout } from "../components/PageLayout"
import { CalendarHandoffSection } from "../components/landing/sections/CalendarHandoffSection"
import { HeroSection } from "../components/landing/sections/HeroSection"
import { HistorySection } from "../components/landing/sections/HistorySection"
import { JournalSection } from "../components/landing/sections/JournalSection"
import { StatementSection } from "../components/landing/sections/StatementSection"
import { SupportingSection } from "../components/landing/sections/SupportingSection"
import type { PageProps } from "../types/landing"

export function HomePage({ locale, switchTo, text }: PageProps) {
  const strings = text.home

  return (
    <PageLayout locale={locale} text={text} switchTo={switchTo}>
      <HeroSection locale={locale} {...strings.hero} />
      <StatementSection
        ariaLabel={strings.statement.ariaLabel}
        bottomAlt={strings.statement.bottomAlt}
        titleLines={strings.statement.titleLines}
        topAlt={strings.statement.topAlt}
      />
      <JournalSection {...strings.journal} />
      <HistorySection {...strings.history} />
      <CalendarHandoffSection {...strings.calendarHandoff} />
      <SupportingSection
        eyebrow={strings.sectionIntro.eyebrow}
        protein={strings.protein}
        tempo={strings.tempo}
        titleLines={strings.sectionIntro.titleLines}
      />
    </PageLayout>
  )
}
