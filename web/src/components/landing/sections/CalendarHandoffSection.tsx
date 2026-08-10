import workoutResultImage from "../../../assets/landing/08-workout-result-top.PNG"
import deviceCalendarEventImage from "../../../assets/landing/17-device-calendar-event.PNG"
import iosCalendarMonthImage from "../../../assets/landing/16-ios-home-calendar.PNG"
import { StaticPhone } from "../StaticPhone"

type CalendarHandoffStep = {
  description: string
  eyebrow: string
  id: string
  imageAlt: string
  titleLines: readonly string[]
}

type CalendarHandoffSectionProps = {
  ariaLabel: string
  steps: readonly CalendarHandoffStep[]
}

const handoffImages: Record<string, string> = {
  result: workoutResultImage,
  month: iosCalendarMonthImage,
  detail: deviceCalendarEventImage,
}

export function CalendarHandoffSection({
  ariaLabel,
  steps,
}: CalendarHandoffSectionProps) {
  return (
    <section
      aria-label={ariaLabel}
      className="relative bg-canvas py-section-mobile desktop:py-section"
      data-landing-section="calendar-handoff"
      id="calendar-handoff"
    >
      <ol className="mx-auto my-0 grid max-w-content-wide list-none gap-20 px-page-mobile phone:px-page desktop:gap-27.5">
        {steps.map((step, index) => (
          <li key={step.id}>
            <article
              aria-labelledby={`calendar-handoff-${step.id}-title`}
              className="grid items-center gap-10 desktop:min-h-172.5 desktop:grid-cols-[0.78fr_1.22fr] desktop:gap-20"
              data-calendar-handoff-step={step.id}
            >
              <div className="max-w-copy">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-surface-strong text-caption font-bold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="m-0 text-sm font-bold text-brand">{step.eyebrow}</p>
                </div>
                <h2
                  id={`calendar-handoff-${step.id}-title`}
                  className="my-0 break-keep text-section-mobile font-heavy text-ink desktop:text-feature"
                >
                  {step.titleLines.map((line) => (
                    <span className="block" key={`${step.id}-${line}`}>
                      {line}
                    </span>
                  ))}
                </h2>
                <p className="mt-5 mb-0 break-keep text-body text-ink-secondary desktop:mt-6 desktop:text-body-lg">
                  {step.description}
                </p>
              </div>

              <div
                className="grid min-h-137.5 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage px-4 py-9 desktop:min-h-160 desktop:rounded-feature"
                data-calendar-handoff-visual={step.id}
              >
                <StaticPhone
                  className="w-47.5 desktop:w-58.75"
                  imageAlt={step.imageAlt}
                  imageSrc={handoffImages[step.id] ?? workoutResultImage}
                />
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
