import homeBottomImage from "../../../assets/landing/01b-journal-home-bottom-mobile.PNG"
import homeTopImage from "../../../assets/landing/01a-journal-home-top-mobile.PNG"
import { FeatureCard } from "../FeatureCard"

type StatementSectionProps = {
  ariaLabel: string
  bottomAlt: string
  titleLines: readonly string[]
  topAlt: string
}

export function StatementSection({
  ariaLabel,
  bottomAlt,
  titleLines,
  topAlt,
}: StatementSectionProps) {
  return (
    <section
      aria-label={ariaLabel}
      className="relative bg-canvas"
      data-landing-section="statement"
      id="statement"
    >
      <FeatureCard
        background="canvas"
        headingLevel="h2"
        phones={[
          {
            angle: 8,
            screens: [
              {
                imageAlt: topAlt,
                imageSrc: homeTopImage,
              },
              {
                imageAlt: bottomAlt,
                imageSrc: homeBottomImage,
              },
            ],
          },
        ]}
        steps={[
          {
            accentLineIndex: 2,
            titleLines,
          },
        ]}
        visualPosition="right"
      />
    </section>
  )
}
