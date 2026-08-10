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
      <HeroSection />
      <StatementSection
        ariaLabel={strings.statement.ariaLabel}
        bottomAlt={strings.statement.bottomAlt}
        titleLines={strings.statement.titleLines}
        topAlt={strings.statement.topAlt}
      />
      <JournalSection
        eyebrow={strings.journalIntro.eyebrow}
        titleLines={strings.journalIntro.titleLines}
      />
      <HistorySection />
      <CalendarHandoffSection />
      <SupportingSection
        eyebrow={strings.sectionIntro.eyebrow}
        protein={strings.protein}
        tempo={strings.tempo}
        titleLines={strings.sectionIntro.titleLines}
      />
    </PageLayout>
  )
}
