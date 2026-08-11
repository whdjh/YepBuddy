import { createRef, useEffect, useMemo, useRef } from "react"
import {
  SequencePhone3D,
  type SequencePhoneController,
} from "./SequencePhone3D"

type FeatureStep = {
  accentLineIndex?: number
  description?: string
  eyebrow?: string
  titleLines: readonly string[]
}

type FeatureScreen = {
  imageAlt: string
  imageSrc: string
}

type FeaturePhone = {
  angle: number
  screens: readonly FeatureScreen[]
}

type FeatureCardProps = {
  background: "canvas" | "surface"
  headingLevel: "h2" | "h3"
  phones: readonly FeaturePhone[]
  steps: readonly FeatureStep[]
  visualPosition: "left" | "right"
}

export function FeatureCard({
  background,
  headingLevel,
  phones,
  steps,
  visualPosition,
}: FeatureCardProps) {
  const Heading = headingLevel
  const hasStepSequence = steps.length > 1
  const hasScreenSequence = phones.some((phone) => phone.screens.length > 1)
  const hasScrollSequence = hasStepSequence || hasScreenSequence
  const isHomeSequence = hasScreenSequence && !hasStepSequence
  const cardRef = useRef<HTMLElement>(null)
  const sequenceRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])
  const phoneRefs = useRef<(HTMLDivElement | null)[]>([])
  const phoneControllerRefs = useMemo(
    () =>
      Array.from({ length: phones.length }, () =>
        createRef<SequencePhoneController>(),
      ),
    [phones.length],
  )
  const tapPulseRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const card = cardRef.current
    const sequence = sequenceRef.current
    const copy = copyRef.current
    const visual = visualRef.current
    const stepElements = stepRefs.current.slice(0, steps.length).filter(
      (step): step is HTMLDivElement => step !== null,
    )
    const phoneElements = phoneRefs.current.slice(0, phones.length).filter(
      (phone): phone is HTMLDivElement => phone !== null,
    )

    if (
      !card ||
      !sequence ||
      !copy ||
      !visual ||
      stepElements.length !== steps.length ||
      phoneElements.length !== phones.length
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

      const clamp = (value: number) => Math.min(1, Math.max(0, value))
      const rangeProgress = (start: number, end: number, value: number) =>
        clamp((value - start) / (end - start))
      const smooth = (value: number) => value * value * (3 - 2 * value)
      const easeRange = (start: number, end: number, value: number) =>
        smooth(rangeProgress(start, end, value))

      const syncSequence = (progress: number) => {
        if (!hasScrollSequence) return

        const detailVisibility = isHomeSequence
          ? easeRange(0.46, 0.54, progress)
          : easeRange(0.3, 0.43, progress)
        const tapVisibility = isHomeSequence
          ? 0
          : easeRange(0.16, 0.23, progress) *
            (1 - easeRange(0.28, 0.34, progress))
        const activeScreen = detailVisibility >= 0.5 ? 1 : 0
        phoneControllerRefs.forEach((controllerRef) =>
          controllerRef.current?.setScreen(activeScreen),
        )

        if (tapPulseRef.current) {
          gsap.set(tapPulseRef.current, {
            autoAlpha: tapVisibility,
            boxShadow: `0 0 0 ${18 * tapVisibility}px rgba(255, 255, 255, 0)`,
            scale: 0.55 + tapVisibility * 0.85,
          })
        }

        if (hasStepSequence) {
          stepElements.forEach((step, index) => {
            step.hidden = index !== (progress < 0.38 ? 0 : 1)
          })
        }
      }

      gsap.registerPlugin(ScrollTrigger)
      const media = gsap.matchMedia(card)
      animationMedia = media
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) {
            syncSequence(isHomeSequence ? 0 : 1)
            return
          }

          gsap.from(copy, {
            autoAlpha: 0,
            duration: isHomeSequence ? 0.9 : hasStepSequence ? 0.72 : 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: isHomeSequence ? "top 66%" : "top 70%",
              once: true,
            },
            y: isHomeSequence ? 28 : hasStepSequence ? 28 : 26,
          })
          gsap.from(phoneElements, {
            autoAlpha: 0,
            duration: isHomeSequence ? 0.8 : hasStepSequence ? 0.75 : 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: visual,
              start: isHomeSequence ? "top 68%" : "top 72%",
              once: true,
            },
            stagger: 0.16,
            y: (index) =>
              isHomeSequence ? 48 : hasStepSequence ? 54 : index === 0 ? 64 : -14,
          })

          if (hasScrollSequence) {
            const sequenceTrigger = ScrollTrigger.create({
              end: () =>
                isHomeSequence
                  ? "bottom bottom"
                  : window.innerWidth <= 760
                    ? "bottom 24%"
                    : "bottom bottom",
              invalidateOnRefresh: true,
              onRefresh: (self) => syncSequence(self.progress),
              onUpdate: (self) => syncSequence(self.progress),
              scrub: isHomeSequence ? 0.35 : true,
              start: () =>
                isHomeSequence
                  ? window.innerWidth <= 760
                    ? "top top+=60"
                    : "top top+=64"
                  : window.innerWidth <= 760
                    ? "top 72%"
                    : "top top+=64",
              trigger: sequence,
            })
            syncSequence(sequenceTrigger.progress)
          }
        },
      )
    }

    void setupAnimation()

    return () => {
      cancelled = true
      animationMedia?.revert()
    }
  }, [
    hasScreenSequence,
    hasScrollSequence,
    hasStepSequence,
    isHomeSequence,
    phoneControllerRefs,
    phones,
    steps,
  ])

  return (
    <article
      ref={cardRef}
      className={
        background === "canvas"
          ? "mx-auto max-w-content px-page-mobile phone:px-page"
          : "mx-auto max-w-content rounded-feature-mobile bg-surface px-page-mobile py-14.5 phone:px-12 desktop:rounded-feature desktop:p-feature-card"
      }
    >
      <div
        ref={sequenceRef}
        className={
          steps.length > 1
            ? "relative min-h-[175svh] desktop:min-h-[145svh]"
            : isHomeSequence
              ? "relative min-h-[190svh]"
            : "relative"
        }
      >
        <div
          className={
            hasScrollSequence
              ? isHomeSequence
                ? "sticky top-header-mobile grid min-h-[calc(100svh-60px)] items-center gap-8 phone:top-header phone:min-h-[calc(100svh-64px)] desktop:grid-cols-[1fr_0.72fr] desktop:gap-23"
                : "sticky top-header-mobile grid min-h-[calc(100svh-60px)] items-center gap-6 phone:top-header phone:min-h-[calc(100svh-64px)] desktop:grid-cols-2 desktop:gap-16"
              : "grid min-h-140 items-center gap-8.5 desktop:grid-cols-[0.9fr_1.1fr] desktop:gap-16"
          }
        >
          <div
            ref={copyRef}
            className={
              visualPosition === "left"
                ? isHomeSequence
                  ? "max-w-720px desktop:order-2"
                  : "max-w-copy desktop:order-2"
                : isHomeSequence
                  ? "max-w-720px desktop:order-1"
                  : "max-w-copy desktop:order-1"
            }
          >
            {steps.map((step, stepIndex) => (
              <div
                hidden={stepIndex !== 0}
                key={`${step.eyebrow}-${step.titleLines.join("-")}`}
                ref={(element) => {
                  stepRefs.current[stepIndex] = element
                }}
              >
                {step.eyebrow ? (
                  <p className="m-0 text-eyebrow-mobile font-bold text-brand phone:text-eyebrow">
                    {step.eyebrow}
                  </p>
                ) : null}
                <Heading
                  className={
                    isHomeSequence
                      ? "m-0 break-keep text-statement-mobile font-emphasis text-ink desktop:text-statement"
                      : "my-4.5 break-keep text-[38px] leading-[1.12] font-heavy tracking-[-0.055em] text-ink desktop:my-6 desktop:text-[clamp(40px,4.4vw,58px)]"
                  }
                >
                  {step.titleLines.map((line, lineIndex) => (
                    <span
                      className={
                        lineIndex === step.accentLineIndex
                          ? "block text-brand"
                          : "block"
                      }
                      key={`${lineIndex}-${line}`}
                    >
                      {line}
                    </span>
                  ))}
                </Heading>
                {step.description ? (
                  <p className="m-0 max-w-copy break-keep text-body text-ink-secondary desktop:text-body-lg">
                    {step.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>

          <div
            ref={visualRef}
            className={
              hasScrollSequence
                ? isHomeSequence
                  ? visualPosition === "left"
                    ? "relative grid min-h-140 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-1 desktop:min-h-165 desktop:rounded-feature"
                    : "relative grid min-h-140 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-2 desktop:min-h-165 desktop:rounded-feature"
                  : visualPosition === "left"
                  ? "relative grid min-h-130 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-1 desktop:min-h-162.5 desktop:rounded-visual"
                  : "relative grid min-h-130 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-2 desktop:min-h-162.5 desktop:rounded-visual"
                : visualPosition === "left"
                  ? "relative grid min-h-125 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-1 desktop:min-h-140 desktop:rounded-visual"
                  : "relative grid min-h-125 place-items-center overflow-hidden rounded-visual-mobile border border-line bg-device-stage desktop:order-2 desktop:min-h-140 desktop:rounded-visual"
            }
          >
            {phones.map((phone, phoneIndex) => (
              <div
                key={`${phone.screens[0].imageSrc}-${phone.angle}`}
                ref={(element) => {
                  phoneRefs.current[phoneIndex] = element
                }}
                className={
                  phones.length === 1
                    ? isHomeSequence
                      ? "relative col-start-1 row-start-1 aspect-phone w-[min(55vw,205px)] desktop:w-56.25"
                      : "relative col-start-1 row-start-1 aspect-phone w-[min(48vw,190px)] desktop:w-53.5"
                    : phoneIndex === 0
                      ? "relative col-start-1 row-start-1 aspect-phone w-[min(41vw,165px)] -translate-x-1/5 translate-y-10 desktop:w-47.5 desktop:-translate-x-23.75 desktop:translate-y-11.25"
                      : "relative col-start-1 row-start-1 aspect-phone w-[min(41vw,165px)] translate-x-1/5 -translate-y-8.75 desktop:w-47.5 desktop:translate-x-23.75 desktop:-translate-y-11.25"
                }
              >
                <SequencePhone3D
                  angle={phone.angle}
                  className="w-full"
                  controllerRef={phoneControllerRefs[phoneIndex]}
                  screens={phone.screens}
                />
                {hasStepSequence ? (
                  <span
                    aria-hidden="true"
                    ref={tapPulseRef}
                    className="pointer-events-none absolute top-[39%] left-1/2 z-10 aspect-square w-12 -translate-x-1/2 -translate-y-1/2 scale-[0.55] rounded-full border-2 border-white/90 opacity-0"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
