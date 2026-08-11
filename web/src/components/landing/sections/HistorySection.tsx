import { useEffect, useRef } from "react"
import workoutResultBottomImage from "../../../assets/landing/09-workout-result-bottom.PNG"
import workoutResultEditImage from "../../../assets/landing/10-workout-result-edit-sheet.png"
import workoutResultTopImage from "../../../assets/landing/08-workout-result-top.PNG"
import sessionListFilteredImage from "../../../assets/landing/13-session-list-filtered.PNG"
import sessionListScrolledImage from "../../../assets/landing/12-session-list-scrolled.PNG"
import sessionListTopImage from "../../../assets/landing/11-session-list-top.PNG"
import workoutCalendarLongPressImage from "../../../assets/landing/15-workout-calendar-long-press.PNG"
import workoutCalendarImage from "../../../assets/landing/14-workout-calendar.PNG"
import {
  SequencePhone3D,
  type SequencePhoneController,
  type SequencePhoneScreen,
} from "../SequencePhone3D"

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
  const historySequenceRef = useRef<HTMLDivElement>(null)
  const calendarSequenceRef = useRef<HTMLElement>(null)
  const sessionControllerRef = useRef<SequencePhoneController | null>(null)
  const resultControllerRef = useRef<SequencePhoneController | null>(null)
  const calendarControllerRef = useRef<SequencePhoneController | null>(null)
  const sessionLabelRef = useRef<HTMLElement>(null)
  const resultLabelRef = useRef<HTMLElement>(null)
  const calendarLabelRef = useRef<HTMLElement>(null)
  const sessionScreens: SequencePhoneScreen[] = [
    { imageAlt: imageAlts.sessionTop, imageSrc: sessionListTopImage },
    { imageAlt: imageAlts.sessionScrolled, imageSrc: sessionListScrolledImage },
    { imageAlt: imageAlts.sessionFiltered, imageSrc: sessionListFilteredImage },
  ]
  const resultScreens: SequencePhoneScreen[] = [
    { imageAlt: imageAlts.resultTop, imageSrc: workoutResultTopImage },
    { imageAlt: imageAlts.resultBottom, imageSrc: workoutResultBottomImage },
    { imageAlt: imageAlts.resultEdit, imageSrc: workoutResultEditImage },
  ]
  const calendarScreens: SequencePhoneScreen[] = [
    { imageAlt: calendar.imageAlts.default, imageSrc: workoutCalendarImage },
    { imageAlt: calendar.imageAlts.pressed, imageSrc: workoutCalendarLongPressImage },
  ]

  useEffect(() => {
    const historySequence = historySequenceRef.current
    const calendarSequence = calendarSequenceRef.current
    const sessionLabel = sessionLabelRef.current
    const resultLabel = resultLabelRef.current
    const calendarLabel = calendarLabelRef.current
    if (
      !historySequence ||
      !calendarSequence ||
      !sessionLabel ||
      !resultLabel ||
      !calendarLabel
    ) {
      return
    }

    let cancelled = false
    let animationMedia: { revert: () => void } | undefined

    const setupAnimation = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])
      if (cancelled) return

      const syncHistory = (progress: number) => {
        const sessionIndex = progress >= 0.73 ? 2 : progress >= 0.31 ? 1 : 0
        const resultIndex = progress >= 0.79 ? 2 : progress >= 0.45 ? 1 : 0
        const sessionLabels = [
          screenLabels.sessionTop,
          screenLabels.sessionScrolled,
          screenLabels.sessionFiltered,
        ]
        const resultLabels = [
          screenLabels.resultTop,
          screenLabels.resultBottom,
          screenLabels.resultEdit,
        ]
        sessionControllerRef.current?.setScreen(sessionIndex)
        resultControllerRef.current?.setScreen(resultIndex)
        sessionControllerRef.current?.setRotationY(
          Math.sin(progress * Math.PI) * 0.12,
        )
        resultControllerRef.current?.setRotationY(
          -Math.sin(progress * Math.PI) * 0.12,
        )
        sessionLabel.textContent = sessionLabels[sessionIndex]
        resultLabel.textContent = resultLabels[resultIndex]
      }

      const syncCalendar = (progress: number) => {
        const screenIndex = progress >= 0.58 ? 1 : 0
        calendarControllerRef.current?.setScreen(screenIndex)
        calendarControllerRef.current?.setRotationY(progress * 0.16)
        calendarLabel.textContent =
          screenIndex === 0
            ? calendar.screenLabels.default
            : calendar.screenLabels.pressed
      }

      gsap.registerPlugin(ScrollTrigger)
      const media = gsap.matchMedia(historySequence)
      animationMedia = media
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) {
            syncHistory(0)
            syncCalendar(0)
            return
          }

          const historyTrigger = ScrollTrigger.create({
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onRefresh: (self) => syncHistory(self.progress),
            onUpdate: (self) => syncHistory(self.progress),
            scrub: 0.35,
            start: () =>
              window.innerWidth <= 760 ? "top 72%" : "top top+=64",
            trigger: historySequence,
          })
          const calendarTrigger = ScrollTrigger.create({
            end: "bottom bottom",
            invalidateOnRefresh: true,
            onRefresh: (self) => syncCalendar(self.progress),
            onUpdate: (self) => syncCalendar(self.progress),
            scrub: 0.35,
            start: () =>
              window.innerWidth <= 760 ? "top 72%" : "top top+=64",
            trigger: calendarSequence,
          })
          syncHistory(historyTrigger.progress)
          syncCalendar(calendarTrigger.progress)
        },
      )
    }

    void setupAnimation()

    return () => {
      cancelled = true
      animationMedia?.revert()
    }
  }, [calendar.screenLabels, screenLabels])

  return (
    <section
      aria-labelledby="history-title"
      className="relative bg-surface py-section-mobile desktop:py-section"
      data-landing-section="history"
      id="history"
    >
      <div className="mx-auto max-w-content-wide px-page-mobile phone:px-page">
        <div
          ref={historySequenceRef}
          className="relative min-h-[220svh] motion-reduce:min-h-0 desktop:min-h-[235svh]"
          data-history-sequence
        >
          <article className="desktop:sticky desktop:top-header desktop:grid desktop:min-h-[calc(100svh-64px)] desktop:grid-cols-[0.72fr_1.28fr] desktop:items-center desktop:gap-20">
            <div className="flex min-h-[55svh] max-w-copy flex-col justify-center desktop:min-h-0">
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
              className="sticky top-header-mobile grid min-h-[calc(100svh-60px)] place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage motion-reduce:relative motion-reduce:top-auto motion-reduce:min-h-150 desktop:static desktop:min-h-170 desktop:rounded-feature"
              data-history-visual
              role="group"
            >
              <figure className="relative col-start-1 row-start-1 m-0 -translate-x-27% -translate-y-12%">
                <SequencePhone3D
                  angle={8}
                  className="w-[min(43vw,165px)] desktop:w-53.5"
                  controllerRef={sessionControllerRef}
                  screens={sessionScreens}
                />
              </figure>
              <figure className="relative col-start-1 row-start-1 m-0 translate-x-[27%] translate-y-[12%]">
                <SequencePhone3D
                  angle={-8}
                  className="w-[min(43vw,165px)] desktop:w-53.5"
                  controllerRef={resultControllerRef}
                  screens={resultScreens}
                />
              </figure>
              <div className="pointer-events-none absolute inset-x-0 bottom-5 z-5 grid grid-cols-2 px-7 text-center desktop:px-14">
                <span
                  ref={sessionLabelRef}
                  className="text-caption font-bold text-ink-secondary"
                >
                  {screenLabels.sessionTop}
                </span>
                <span
                  ref={resultLabelRef}
                  className="text-caption font-bold text-ink-secondary"
                >
                  {screenLabels.resultTop}
                </span>
              </div>
            </div>
          </article>
        </div>

        <article
          ref={calendarSequenceRef}
          aria-labelledby="history-calendar-title"
          className="relative min-h-[190svh] pt-section-mobile motion-reduce:min-h-0 desktop:min-h-[175svh] desktop:pt-section"
          data-calendar-peek-sequence
        >
          <div className="desktop:sticky desktop:top-header desktop:grid desktop:min-h-[calc(100svh-64px)] desktop:grid-cols-[1.08fr_0.92fr] desktop:items-center desktop:gap-20">
            <div className="flex min-h-[55svh] max-w-copy flex-col justify-center desktop:order-2 desktop:min-h-0">
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
              className="sticky top-header-mobile grid min-h-[calc(100svh-60px)] place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage motion-reduce:relative motion-reduce:top-auto motion-reduce:min-h-150 desktop:static desktop:order-1 desktop:min-h-160 desktop:rounded-feature"
              role="group"
            >
              <figure className="m-0">
                <SequencePhone3D
                  angle={8}
                  className="w-47.5 desktop:w-56.25"
                  controllerRef={calendarControllerRef}
                  screens={calendarScreens}
                />
                <figcaption
                  ref={calendarLabelRef}
                  className="mt-3 text-center text-caption font-bold text-ink-secondary"
                >
                  {calendar.screenLabels.default}
                </figcaption>
              </figure>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
