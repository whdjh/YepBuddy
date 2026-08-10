type SectionIntroProps = {
  eyebrow: string
  headingId: string
  headingLevel?: "h1" | "h2"
  titleLines: readonly string[]
}

export function SectionIntro({
  eyebrow,
  headingId,
  headingLevel = "h2",
  titleLines,
}: SectionIntroProps) {
  const Heading = headingLevel

  return (
    <header className="max-w-intro py-section-mobile desktop:py-section">
      <p className="mb-[18px] text-eyebrow-mobile font-bold text-brand phone:text-eyebrow">
        {eyebrow}
      </p>
      <Heading
        id={headingId}
        className="m-0 break-keep text-section-mobile font-heavy text-ink desktop:text-section-compact"
      >
        {titleLines.map((line, index) => (
          <span className="block" key={`${index}-${line}`}>
            {line}
          </span>
        ))}
      </Heading>
    </header>
  )
}
