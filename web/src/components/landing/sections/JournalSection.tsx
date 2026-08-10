import { SectionIntro } from "../SectionIntro"

type JournalSectionProps = {
  eyebrow: string
  titleLines: readonly string[]
}

export function JournalSection({ eyebrow, titleLines }: JournalSectionProps) {
  return (
    <section
      aria-labelledby="journal-title"
      className="relative min-h-[calc(480svh+410px)] bg-canvas desktop:min-h-[calc(480svh+590px)]"
      data-landing-section="journal"
      id="journal"
    >
      <div className="mx-auto max-w-content px-page-mobile phone:px-page">
        <SectionIntro
          eyebrow={eyebrow}
          headingId="journal-title"
          headingLevel="h2"
          titleLines={titleLines}
        />
      </div>
    </section>
  )
}
