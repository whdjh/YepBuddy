import workoutResultBottomImage from "../../../assets/landing/09-workout-result-bottom.PNG"
import workoutResultEditImage from "../../../assets/landing/10-workout-result-edit-sheet.png"
import workoutResultTopImage from "../../../assets/landing/08-workout-result-top.PNG"
import sessionListFilteredImage from "../../../assets/landing/13-session-list-filtered.PNG"
import sessionListScrolledImage from "../../../assets/landing/12-session-list-scrolled.PNG"
import sessionListTopImage from "../../../assets/landing/11-session-list-top.PNG"
import workoutCalendarLongPressImage from "../../../assets/landing/15-workout-calendar-long-press.PNG"
import workoutCalendarImage from "../../../assets/landing/14-workout-calendar.PNG"
import { StaticPhone } from "../StaticPhone"

type ScreenState = {
  alt: string
  id: string
  image: string
  label: string
}

type HistorySectionProps = {
  calendar: {
    description: string
    eyebrow: string
    imageAlts: {
      default: string
      pressed: string
    }
    screenLabels: {
      default: string
      pressed: string
    }
    titleLines: readonly string[]
  }
  description: string
  eyebrow: string
  imageAlts: {
    resultBottom: string
    resultEdit: string
    resultTop: string
    sessionFiltered: string
    sessionScrolled: string
    sessionTop: string
  }
  resultHeading: string
  screenLabels: {
    resultBottom: string
    resultEdit: string
    resultTop: string
    sessionFiltered: string
    sessionScrolled: string
    sessionTop: string
  }
  sessionHeading: string
  titleLines: readonly string[]
}

function ScreenStateGrid({ screens }: { screens: readonly ScreenState[] }) {
  return (
    <div className="grid grid-cols-3 items-end gap-2 phone:gap-3.5">
      {screens.map((screen) => (
        <figure className="m-0 min-w-0" key={screen.id}>
          <StaticPhone className="w-full" imageAlt={screen.alt} imageSrc={screen.image} />
          <figcaption className="mt-3 text-center text-caption font-bold text-ink-secondary">
            {screen.label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export function HistorySection({
  calendar,
  description,
  eyebrow,
  imageAlts,
  resultHeading,
  screenLabels,
  sessionHeading,
  titleLines,
}: HistorySectionProps) {
  const sessionScreens: ScreenState[] = [
    {
      alt: imageAlts.sessionTop,
      id: "session-top",
      image: sessionListTopImage,
      label: screenLabels.sessionTop,
    },
    {
      alt: imageAlts.sessionScrolled,
      id: "session-scrolled",
      image: sessionListScrolledImage,
      label: screenLabels.sessionScrolled,
    },
    {
      alt: imageAlts.sessionFiltered,
      id: "session-filtered",
      image: sessionListFilteredImage,
      label: screenLabels.sessionFiltered,
    },
  ]
  const resultScreens: ScreenState[] = [
    {
      alt: imageAlts.resultTop,
      id: "result-top",
      image: workoutResultTopImage,
      label: screenLabels.resultTop,
    },
    {
      alt: imageAlts.resultBottom,
      id: "result-bottom",
      image: workoutResultBottomImage,
      label: screenLabels.resultBottom,
    },
    {
      alt: imageAlts.resultEdit,
      id: "result-edit",
      image: workoutResultEditImage,
      label: screenLabels.resultEdit,
    },
  ]

  return (
    <section
      aria-labelledby="history-title"
      className="relative bg-surface py-section-mobile desktop:py-section"
      data-landing-section="history"
      id="history"
    >
      <div className="mx-auto max-w-content-wide px-page-mobile phone:px-page">
        <article className="grid items-center gap-10 desktop:grid-cols-[0.72fr_1.28fr] desktop:gap-20">
          <div className="max-w-copy">
            <p className="m-0 text-sm font-bold text-brand">{eyebrow}</p>
            <h2
              id="history-title"
              className="my-4.5 break-keep text-section-mobile font-heavy text-ink desktop:my-6 desktop:text-feature"
            >
              {titleLines.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="m-0 break-keep text-body text-ink-secondary desktop:text-body-lg">
              {description}
            </p>
          </div>

          <div
            aria-label={`${sessionHeading}, ${resultHeading}`}
            className="grid gap-10 overflow-hidden rounded-visual-mobile border border-line bg-device-stage px-3 py-8 phone:px-8 desktop:rounded-feature desktop:px-10 desktop:py-12"
            data-history-visual
            role="group"
          >
            <div>
              <h3 className="mb-4 text-sm font-bold text-ink-secondary">{sessionHeading}</h3>
              <ScreenStateGrid screens={sessionScreens} />
            </div>
            <div className="border-t border-line-strong pt-8">
              <h3 className="mb-4 text-sm font-bold text-ink-secondary">{resultHeading}</h3>
              <ScreenStateGrid screens={resultScreens} />
            </div>
          </div>
        </article>

        <article
          aria-labelledby="history-calendar-title"
          className="grid items-center gap-10 pt-section-mobile desktop:grid-cols-[1.08fr_0.92fr] desktop:gap-20 desktop:pt-section"
        >
          <div className="order-2 max-w-copy desktop:order-2">
            <p className="m-0 text-sm font-bold text-brand">{calendar.eyebrow}</p>
            <h2
              id="history-calendar-title"
              className="my-4.5 break-keep text-section-mobile font-heavy text-ink desktop:my-6 desktop:text-feature"
            >
              {calendar.titleLines.map((line) => (
                <span className="block" key={line}>
                  {line}
                </span>
              ))}
            </h2>
            <p className="m-0 break-keep text-body text-ink-secondary desktop:text-body-lg">
              {calendar.description}
            </p>
          </div>

          <div
            aria-label={calendar.eyebrow}
            className="order-1 grid min-h-137.5 grid-cols-2 place-items-center gap-3 overflow-hidden rounded-visual-mobile border border-line bg-device-stage px-4 py-9 phone:px-8 desktop:min-h-160 desktop:rounded-feature"
            role="group"
          >
            <figure className="m-0 w-full max-w-48">
              <StaticPhone
                className="w-full -rotate-3"
                imageAlt={calendar.imageAlts.default}
                imageSrc={workoutCalendarImage}
              />
              <figcaption className="mt-3 text-center text-caption font-bold text-ink-secondary">
                {calendar.screenLabels.default}
              </figcaption>
            </figure>
            <figure className="m-0 w-full max-w-48">
              <StaticPhone
                className="w-full rotate-3"
                imageAlt={calendar.imageAlts.pressed}
                imageSrc={workoutCalendarLongPressImage}
              />
              <figcaption className="mt-3 text-center text-caption font-bold text-ink-secondary">
                {calendar.screenLabels.pressed}
              </figcaption>
            </figure>
          </div>
        </article>
      </div>
    </section>
  )
}
