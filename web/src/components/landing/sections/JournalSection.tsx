import workoutActiveBottomImage from "../../../assets/landing/03b-workout-active-bottom.PNG"
import workoutActiveTopImage from "../../../assets/landing/03a-workout-active-top.PNG"
import workoutCountdownImage from "../../../assets/landing/02-workout-countdown.PNG"
import workoutDrawerCardioImage from "../../../assets/landing/05-workout-drawer-cardio.PNG"
import liveActivityIslandImage from "../../../assets/landing/06-live-activity-island-full.PNG"
import liveActivityLockImage from "../../../assets/landing/07-live-activity-lock-full.PNG"
import workoutResultBottomImage from "../../../assets/landing/09-workout-result-bottom.PNG"
import workoutResultTopImage from "../../../assets/landing/08-workout-result-top.PNG"
import { SectionIntro } from "../SectionIntro"
import { StaticPhone } from "../StaticPhone"

type JournalStep = {
  description: string
  eyebrow: string
  id: string
  titleLines: readonly string[]
}

type JournalImageAlts = {
  activeBottom: string
  activeTop: string
  countdown: string
  drawerCardio: string
  liveIsland: string
  liveLock: string
  resultBottom: string
  resultTop: string
}

type JournalSectionProps = {
  eyebrow: string
  imageAlts: JournalImageAlts
  liveCallout: {
    description: string
    title: string
  }
  steps: readonly JournalStep[]
  titleLines: readonly string[]
}

type JournalVisualProps = {
  imageAlts: JournalImageAlts
  liveCallout: JournalSectionProps["liveCallout"]
  stepId: string
}

const visualClassName =
  "relative grid min-h-137.5 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage px-3 py-8 phone:min-h-150 phone:px-8 desktop:min-h-160 desktop:rounded-feature"

function PhonePair({
  firstAlt,
  firstImage,
  secondAlt,
  secondImage,
}: {
  firstAlt: string
  firstImage: string
  secondAlt: string
  secondImage: string
}) {
  return (
    <div className="grid w-full grid-cols-2 place-items-center gap-2 phone:gap-4">
      <StaticPhone
        className="w-[min(41vw,165px)] translate-y-8 -rotate-3 desktop:w-47.5"
        imageAlt={firstAlt}
        imageSrc={firstImage}
      />
      <StaticPhone
        className="w-[min(41vw,165px)] -translate-y-7 rotate-4 desktop:w-47.5"
        imageAlt={secondAlt}
        imageSrc={secondImage}
      />
    </div>
  )
}

function LiveActivityVisual({
  imageAlts,
  liveCallout,
}: Pick<JournalVisualProps, "imageAlts" | "liveCallout">) {
  return (
    <div className={`${visualClassName} min-h-193.5 desktop:min-h-160`}>
      <div className="relative h-177.5 w-full max-w-155 desktop:h-147.5">
        <StaticPhone
          className="absolute top-0 left-1/2 w-41.25 -translate-x-1/2 -rotate-3 desktop:top-4.5 desktop:left-0 desktop:w-56.25 desktop:translate-x-0"
          imageAlt={imageAlts.drawerCardio}
          imageSrc={workoutDrawerCardioImage}
        />

        <div className="absolute top-118.5 left-1/2 z-4 aspect-[3.05/1] w-[min(80vw,280px)] -translate-x-1/2 overflow-hidden rounded-callout bg-device shadow-callout desktop:top-18 desktop:right-0 desktop:left-auto desktop:w-[min(300px,48%)] desktop:translate-x-0">
          <img
            alt={imageAlts.liveIsland}
            className="h-auto w-full"
            decoding="async"
            height="2622"
            loading="lazy"
            src={liveActivityIslandImage}
            width="1206"
          />
        </div>

        <aside className="absolute top-93.5 left-1/2 z-5 w-[min(80vw,280px)] -translate-x-1/2 rounded-callout bg-canvas/94 px-5 py-4.5 text-left shadow-callout backdrop-blur-xl desktop:top-61.5 desktop:right-4.5 desktop:left-auto desktop:w-66 desktop:translate-x-0">
          <strong className="block text-sm text-danger">{liveCallout.title}</strong>
          <span className="mt-1.75 block text-caption text-ink-secondary">
            {liveCallout.description}
          </span>
        </aside>

        <div className="absolute bottom-2 left-1/2 z-4 aspect-[2.42/1] w-[min(80vw,280px)] -translate-x-1/2 overflow-hidden rounded-callout bg-device shadow-callout desktop:right-0 desktop:bottom-16.5 desktop:left-auto desktop:w-[min(300px,48%)] desktop:translate-x-0">
          <img
            alt={imageAlts.liveLock}
            className="h-auto w-full -translate-y-[57%]"
            decoding="async"
            height="2622"
            loading="lazy"
            src={liveActivityLockImage}
            width="1206"
          />
        </div>
      </div>
    </div>
  )
}

function JournalVisual({ imageAlts, liveCallout, stepId }: JournalVisualProps) {
  if (stepId === "record") {
    return (
      <div className={visualClassName} data-journal-visual={stepId}>
        <PhonePair
          firstAlt={imageAlts.activeTop}
          firstImage={workoutActiveTopImage}
          secondAlt={imageAlts.activeBottom}
          secondImage={workoutActiveBottomImage}
        />
      </div>
    )
  }

  if (stepId === "live") {
    return (
      <div data-journal-visual={stepId}>
        <LiveActivityVisual imageAlts={imageAlts} liveCallout={liveCallout} />
      </div>
    )
  }

  if (stepId === "result") {
    return (
      <div className={visualClassName} data-journal-visual={stepId}>
        <PhonePair
          firstAlt={imageAlts.resultTop}
          firstImage={workoutResultTopImage}
          secondAlt={imageAlts.resultBottom}
          secondImage={workoutResultBottomImage}
        />
      </div>
    )
  }

  return (
    <div className={visualClassName} data-journal-visual={stepId}>
      <StaticPhone
        className="w-47.5 desktop:w-56.25"
        imageAlt={imageAlts.countdown}
        imageSrc={workoutCountdownImage}
      />
    </div>
  )
}

export function JournalSection({
  eyebrow,
  imageAlts,
  liveCallout,
  steps,
  titleLines,
}: JournalSectionProps) {
  return (
    <section
      aria-labelledby="journal-title"
      className="relative bg-canvas pb-section-mobile desktop:pb-section"
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

      <div className="mx-auto max-w-content-wide px-page-mobile phone:px-page">
        {steps.map((step) => {
          const headingId = `journal-${step.id}-title`

          return (
            <article
              aria-labelledby={headingId}
              className="grid items-center gap-10 py-17.5 desktop:min-h-190 desktop:grid-cols-[0.78fr_1.22fr] desktop:gap-20 desktop:py-22.5"
              data-journal-step={step.id}
              key={step.id}
            >
              <div className="max-w-copy">
                <p className="m-0 text-sm font-bold text-brand">{step.eyebrow}</p>
                <h3
                  id={headingId}
                  className="my-4.5 break-keep text-section-mobile font-heavy text-ink desktop:my-6 desktop:text-feature"
                >
                  {step.titleLines.map((line) => (
                    <span className="block" key={line}>
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="m-0 max-w-copy break-keep text-body text-ink-secondary desktop:text-body-lg">
                  {step.description}
                </p>
              </div>

              <JournalVisual
                imageAlts={imageAlts}
                liveCallout={liveCallout}
                stepId={step.id}
              />
            </article>
          )
        })}
      </div>
    </section>
  )
}
