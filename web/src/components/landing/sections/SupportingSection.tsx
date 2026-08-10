import proteinDetailImage from "../../../assets/landing/21-protein-detail.png"
import proteinListImage from "../../../assets/landing/20-protein-list.png"
import tempoActiveImage from "../../../assets/landing/19-tempo-active.png"
import tempoSettingsImage from "../../../assets/landing/18-tempo-settings.png"
import { FeatureCard } from "../FeatureCard"
import { SectionIntro } from "../SectionIntro"

type SupportingSectionProps = {
  eyebrow: string
  protein: {
    detailAlt: string
    listAlt: string
    steps: readonly {
      description: string
      eyebrow: string
      titleLines: readonly string[]
    }[]
  }
  tempo: {
    activeAlt: string
    description: string
    eyebrow: string
    settingsAlt: string
    titleLines: readonly string[]
  }
  titleLines: readonly string[]
}

export function SupportingSection({
  eyebrow,
  protein,
  tempo,
  titleLines,
}: SupportingSectionProps) {
  return (
    <section
      aria-labelledby="supporting-tools-title"
      className="relative min-h-[calc(175svh+72rem)] bg-canvas desktop:min-h-[calc(145svh+88rem)]"
      data-landing-section="supporting"
      id="supporting"
    >
      <div className="mx-auto max-w-content px-page-mobile phone:px-page">
        <SectionIntro
          eyebrow={eyebrow}
          headingId="supporting-tools-title"
          headingLevel="h2"
          titleLines={titleLines}
        />
      </div>
      <div className="px-page-mobile phone:px-page">
        <FeatureCard
          background="surface"
          headingLevel="h3"
          phones={[
            {
              angle: 8,
              screens: [
                {
                  imageAlt: tempo.settingsAlt,
                  imageSrc: tempoSettingsImage,
                },
              ],
            },
            {
              angle: -8,
              screens: [
                {
                  imageAlt: tempo.activeAlt,
                  imageSrc: tempoActiveImage,
                },
              ],
            },
          ]}
          steps={[
            {
              description: tempo.description,
              eyebrow: tempo.eyebrow,
              titleLines: tempo.titleLines,
            },
          ]}
          visualPosition="right"
        />
        <div className="mt-4.5 desktop:mt-7">
          <FeatureCard
            background="surface"
            headingLevel="h3"
            phones={[
              {
                angle: -8,
                screens: [
                  {
                    imageAlt: protein.listAlt,
                    imageSrc: proteinListImage,
                  },
                  {
                    imageAlt: protein.detailAlt,
                    imageSrc: proteinDetailImage,
                  },
                ],
              },
            ]}
            steps={protein.steps}
            visualPosition="left"
          />
        </div>
      </div>
    </section>
  )
}
