import { useEffect, useRef } from "react"
import workoutResultImage from "../../../assets/landing/08-workout-result-top.PNG"
import deviceCalendarEventImage from "../../../assets/landing/17-device-calendar-event.PNG"
import iosCalendarMonthImage from "../../../assets/landing/16-ios-home-calendar.PNG"
import {
  SequencePhone3D,
  type SequencePhoneController,
  type SequencePhoneScreen,
} from "../SequencePhone3D"

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

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (value: number) => value * value * (3 - 2 * value)
const easeRange = (start: number, end: number, value: number) =>
  smooth(clamp((value - start) / (end - start)))

export function CalendarHandoffSection({
  ariaLabel,
  steps,
}: CalendarHandoffSectionProps) {
  const sequenceRef = useRef<HTMLDivElement>(null)
  const copyRefs = useRef<(HTMLElement | null)[]>([])
  const phoneControllerRef = useRef<SequencePhoneController | null>(null)
  const phoneScreens: SequencePhoneScreen[] = steps.map((step) => ({
    imageAlt: step.imageAlt,
    imageSrc: handoffImages[step.id] ?? workoutResultImage,
  }))

  useEffect(() => {
    const sequence = sequenceRef.current
    const copyElements = copyRefs.current
      .slice(0, steps.length)
      .filter((element): element is HTMLElement => element !== null)
    if (!sequence || copyElements.length !== steps.length) return

    let cancelled = false
    let animationMedia: { revert: () => void } | undefined

    const setupAnimation = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])
      if (cancelled) return

      const syncSequence = (rawProgress: number) => {
        const progress = clamp(rawProgress)
        const copyIndex = progress < 0.32 ? 0 : progress < 0.7 ? 1 : 2
        const screenIndex = progress < 0.28 ? 0 : progress < 0.72 ? 1 : 2
        const monthTurn = easeRange(0.14, 0.36, progress)
        const detailTurn = easeRange(0.62, 0.84, progress)

        phoneControllerRef.current?.setScreen(screenIndex)
        phoneControllerRef.current?.setPose({
          rotationY: monthTurn * 0.18 - detailTurn * 0.34,
        })
        copyElements.forEach((element, index) => {
          const isActive = index === copyIndex
          element.setAttribute("aria-hidden", String(!isActive))
          if (isActive) element.setAttribute("aria-current", "step")
          else element.removeAttribute("aria-current")
          gsap.set(element, {
            autoAlpha: isActive ? 1 : 0,
            y: isActive ? 0 : 22,
          })
        })
        sequence.dataset.copy = String(copyIndex)
        sequence.dataset.progress = progress.toFixed(3)
        sequence.dataset.screen = String(screenIndex)
      }

      gsap.registerPlugin(ScrollTrigger)
      const media = gsap.matchMedia(sequence)
      animationMedia = media
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) {
            phoneControllerRef.current?.setScreen(0)
            phoneControllerRef.current?.setPose({ rotationY: 0 })
            return
          }

          const trigger = ScrollTrigger.create({
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onRefresh: (self) => syncSequence(self.progress),
            onUpdate: (self) => syncSequence(self.progress),
            scrub: true,
            start: () =>
              window.innerWidth <= 760 ? "top top+=60" : "top top+=64",
            trigger: sequence,
          })
          syncSequence(trigger.progress)
        },
      )
    }

    void setupAnimation()

    return () => {
      cancelled = true
      animationMedia?.revert()
    }
  }, [steps])

  return (
    <section
      aria-label={ariaLabel}
      className="relative bg-canvas py-section-mobile desktop:py-section"
      data-landing-section="calendar-handoff"
      id="calendar-handoff"
    >
      <div
        ref={sequenceRef}
        className="relative mx-auto min-h-[240svh] max-w-content-wide px-page-mobile motion-reduce:min-h-0 phone:px-page"
        data-calendar-handoff-sequence
      >
        <div className="sticky top-header-mobile grid min-h-[calc(100svh-60px)] content-center gap-6 motion-reduce:relative motion-reduce:top-auto motion-reduce:min-h-0 desktop:top-header desktop:min-h-[calc(100svh-64px)] desktop:grid-cols-[0.82fr_1.18fr] desktop:items-center desktop:gap-20">
          <div className="relative min-h-77.5 motion-reduce:min-h-0 desktop:min-h-100">
            {steps.map((step, index) => (
              <article
                aria-hidden={index === 0 ? undefined : "true"}
                aria-labelledby={`calendar-handoff-${step.id}-title`}
                className={
                  index === 0
                    ? "absolute inset-0 flex items-center opacity-100 motion-reduce:relative motion-reduce:visible motion-reduce:mb-10 motion-reduce:opacity-100"
                    : "invisible absolute inset-0 flex items-center opacity-0 motion-reduce:relative motion-reduce:visible motion-reduce:mb-10 motion-reduce:opacity-100"
                }
                data-calendar-handoff-step={step.id}
                key={step.id}
                ref={(element) => {
                  copyRefs.current[index] = element
                }}
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
                    className="my-0 break-keep text-[36px] leading-[1.12] font-heavy tracking-[-0.055em] text-ink desktop:text-feature"
                  >
                    {step.titleLines.map((line) => (
                      <span className="block" key={`${step.id}-${line}`}>
                        {line}
                      </span>
                    ))}
                  </h2>
                  <p className="mt-4 mb-0 break-keep text-[15px] leading-[1.65] text-ink-secondary desktop:mt-6 desktop:text-body-lg">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="grid min-h-[46svh] place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage motion-reduce:min-h-137.5 desktop:min-h-[min(700px,calc(100svh-110px))] desktop:rounded-feature">
            <SequencePhone3D
              angle={-8}
              className="w-42.5 desktop:w-58.75"
              controllerRef={phoneControllerRef}
              screens={phoneScreens}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
