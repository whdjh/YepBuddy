import { useEffect, useRef } from "react"
import workoutActiveBottomImage from "../../../assets/landing/03b-workout-active-bottom.PNG"
import workoutActiveTopImage from "../../../assets/landing/03a-workout-active-top.PNG"
import workoutCountdownImage from "../../../assets/landing/02-workout-countdown.PNG"
import workoutDrawerCardioImage from "../../../assets/landing/05-workout-drawer-cardio.PNG"
import workoutDrawerOpenImage from "../../../assets/landing/04-workout-drawer-open.PNG"
import liveActivityIslandImage from "../../../assets/landing/06-live-activity-island-full.PNG"
import liveActivityLockImage from "../../../assets/landing/07-live-activity-lock-full.PNG"
import workoutResultBottomImage from "../../../assets/landing/09-workout-result-bottom.PNG"
import workoutResultTopImage from "../../../assets/landing/08-workout-result-top.PNG"
import {
  SequencePhone3D,
  type SequencePhoneController,
  type SequencePhoneScreen,
} from "../SequencePhone3D"
import { SectionIntro } from "../SectionIntro"

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
  drawerOpen: string
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

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const smooth = (value: number) => value * value * (3 - 2 * value)
const easeRange = (start: number, end: number, value: number) =>
  smooth(clamp((value - start) / (end - start)))

function getJournalScreenIndex(progress: number) {
  if (progress < 0.185) return 0
  if (progress < 0.36) return 1
  if (progress < 0.48) return 2
  if (progress < 0.56) return 3
  if (progress < 0.73) return 4
  if (progress < 0.9) return 5
  return 6
}

function getJournalCopyIndex(progress: number) {
  if (progress < 0.25) return 0
  if (progress < 0.5) return 1
  if (progress < 0.8) return 2
  return 3
}

export function JournalSection({
  eyebrow,
  imageAlts,
  liveCallout,
  steps,
  titleLines,
}: JournalSectionProps) {
  const sequenceRef = useRef<HTMLDivElement>(null)
  const copyRefs = useRef<(HTMLElement | null)[]>([])
  const liveOverlayRef = useRef<HTMLDivElement>(null)
  const phoneControllerRef = useRef<SequencePhoneController | null>(null)
  const phoneScreens: SequencePhoneScreen[] = [
    { imageAlt: imageAlts.countdown, imageSrc: workoutCountdownImage },
    { imageAlt: imageAlts.activeTop, imageSrc: workoutActiveTopImage },
    { imageAlt: imageAlts.activeBottom, imageSrc: workoutActiveBottomImage },
    { imageAlt: imageAlts.drawerOpen, imageSrc: workoutDrawerOpenImage },
    { imageAlt: imageAlts.drawerCardio, imageSrc: workoutDrawerCardioImage },
    { imageAlt: imageAlts.resultTop, imageSrc: workoutResultTopImage },
    { imageAlt: imageAlts.resultBottom, imageSrc: workoutResultBottomImage },
  ]

  useEffect(() => {
    const sequence = sequenceRef.current
    const copyElements = copyRefs.current
      .slice(0, steps.length)
      .filter((element): element is HTMLElement => element !== null)
    const liveOverlay = liveOverlayRef.current
    if (!sequence || copyElements.length !== steps.length || !liveOverlay) return

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
        const copyIndex = getJournalCopyIndex(progress)
        const screenIndex = getJournalScreenIndex(progress)
        const turnToBack = smooth(easeRange(0.62, 0.7, progress))
        const turnToFront = smooth(easeRange(0.76, 0.84, progress))
        const liveVisibility =
          easeRange(0.51, 0.58, progress) *
          (1 - easeRange(0.6, 0.62, progress))

        phoneControllerRef.current?.setScreen(screenIndex)
        phoneControllerRef.current?.setRotationY(
          Math.PI * (turnToBack + turnToFront),
        )
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
        gsap.set(liveOverlay, {
          autoAlpha: liveVisibility,
          y: 14 * (1 - liveVisibility),
        })
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
            phoneControllerRef.current?.setRotationY(0)
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

      <div
        ref={sequenceRef}
        className="relative mx-auto grid min-h-[480svh] max-w-content-wide grid-cols-1 items-start gap-0 px-page-mobile motion-reduce:block motion-reduce:min-h-0 phone:px-page desktop:grid-cols-[0.78fr_1.22fr] desktop:gap-20"
        data-journal-3d-sequence
      >
        <div className="sticky top-header-mobile z-3 col-start-1 row-start-1 h-[calc(100svh-60px)] motion-reduce:static motion-reduce:h-auto desktop:top-header desktop:z-auto desktop:h-[calc(100svh-64px)]">
          {steps.map((step, index) => (
            <article
              aria-hidden={index === 0 ? undefined : "true"}
              aria-labelledby={`journal-${step.id}-title`}
              className={
                index === 0
                  ? "pointer-events-none absolute inset-0 flex items-end pb-[5svh] opacity-100 motion-reduce:relative motion-reduce:visible motion-reduce:mb-5 motion-reduce:pb-0 motion-reduce:opacity-100 desktop:items-center desktop:pb-0"
                  : "pointer-events-none invisible absolute inset-0 flex items-end pb-[5svh] opacity-0 motion-reduce:relative motion-reduce:visible motion-reduce:mb-5 motion-reduce:pb-0 motion-reduce:opacity-100 desktop:items-center desktop:pb-0"
              }
              data-journal-step={step.id}
              key={step.id}
              ref={(element) => {
                copyRefs.current[index] = element
              }}
            >
              <div className="w-full rounded-callout border border-line bg-canvas/94 p-6 shadow-callout backdrop-blur-xl motion-reduce:bg-canvas desktop:border-0 desktop:bg-transparent desktop:p-0 desktop:shadow-none desktop:backdrop-blur-none">
                <p className="m-0 text-sm font-bold text-brand">{step.eyebrow}</p>
                <h3
                  id={`journal-${step.id}-title`}
                  className="my-3 break-keep text-[34px] leading-[1.12] font-heavy tracking-[-0.055em] text-ink desktop:my-6 desktop:text-feature"
                >
                  {step.titleLines.map((line) => (
                    <span className="block" key={`${step.id}-${line}`}>
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="m-0 max-w-copy break-keep text-[15px] leading-[1.65] text-ink-secondary desktop:text-body-lg">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="relative z-1 col-start-1 row-start-1 h-full min-w-0 motion-reduce:mt-8 motion-reduce:h-auto desktop:col-start-2">
          <div className="sticky top-header-mobile grid h-[58svh] min-h-100 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage motion-reduce:relative motion-reduce:top-auto motion-reduce:h-137.5 desktop:top-header desktop:h-[calc(100svh-64px)] desktop:min-h-155 desktop:rounded-feature">
            <div className="pointer-events-none absolute aspect-square w-[72%] rounded-full bg-[radial-gradient(circle,rgba(155,126,86,0.2),rgba(155,126,86,0)_68%)]" />
            <SequencePhone3D
              className="z-2 w-[min(48vw,190px)] desktop:w-58.75"
              controllerRef={phoneControllerRef}
              screens={phoneScreens}
            />

            <div
              ref={liveOverlayRef}
              aria-hidden="true"
              className="invisible pointer-events-none absolute inset-0 z-4 opacity-0 motion-reduce:hidden"
            >
              <div className="absolute top-[12%] right-[2%] aspect-340/127 w-[min(48%,210px)] shadow-callout desktop:top-[15%] desktop:right-[4%] desktop:w-[min(42%,290px)]">
                <img
                  alt={imageAlts.liveIsland}
                  className="h-full w-full object-contain"
                  decoding="async"
                  height="254"
                  loading="lazy"
                  src={liveActivityIslandImage}
                  width="680"
                />
              </div>
              <aside className="absolute top-[35%] right-[6%] hidden w-[min(38%,250px)] rounded-callout bg-canvas/94 px-5 py-4.5 text-left shadow-callout backdrop-blur-xl desktop:block">
                <strong className="block text-sm text-danger">{liveCallout.title}</strong>
                <span className="mt-1.75 block text-caption text-ink-secondary">
                  {liveCallout.description}
                </span>
              </aside>
              <div className="absolute right-[2%] bottom-[12%] aspect-169/58 w-[min(48%,210px)] shadow-callout desktop:right-[3%] desktop:bottom-[13%] desktop:w-[min(42%,290px)]">
                <img
                  alt={imageAlts.liveLock}
                  className="h-full w-full object-contain"
                  decoding="async"
                  height="232"
                  loading="lazy"
                  src={liveActivityLockImage}
                  width="676"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
