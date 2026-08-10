import { SectionIntro } from "../SectionIntro"

type SupportingSectionProps = {
  eyebrow: string
  titleLines: readonly string[]
}

export function SupportingSection({ eyebrow, titleLines }: SupportingSectionProps) {
  return (
    <section
      aria-labelledby="supporting-tools-title"
      className="relative min-h-[calc(175svh+72rem)] bg-canvas desktop:min-h-[calc(145svh+88rem)]"
      data-landing-section="supporting"
      id="supporting"
    >
      <p
        aria-hidden="true"
        className="absolute top-4 left-page-mobile text-caption text-ink-tertiary phone:left-page"
      >
        지원 도구 섹션
      </p>
      <div className="mx-auto max-w-content px-page-mobile phone:px-page">
        <SectionIntro
          eyebrow={eyebrow}
          headingId="supporting-tools-title"
          headingLevel="h2"
          titleLines={titleLines}
        />
      </div>
    </section>
  )
}
