import { PageLayout } from "../components/PageLayout"
import { CalendarHandoffSection } from "../components/landing/sections/CalendarHandoffSection"
import { HeroSection } from "../components/landing/sections/HeroSection"
import { HistorySection } from "../components/landing/sections/HistorySection"
import { JournalSection } from "../components/landing/sections/JournalSection"
import { StatementSection } from "../components/landing/sections/StatementSection"
import { SupportingSection } from "../components/landing/sections/SupportingSection"
import type { PageProps } from "../types/landing"

export function HomePage({ locale, switchTo, text }: PageProps) {
  const strings = text.home.sectionIntro

  return (
    <PageLayout locale={locale} text={text} switchTo={switchTo}>
      <HeroSection />
      <StatementSection />
      <JournalSection />
      <HistorySection />
      <CalendarHandoffSection />
      <SupportingSection eyebrow={strings.eyebrow} titleLines={strings.titleLines} />
    </PageLayout>
  )
}
