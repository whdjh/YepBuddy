import { useEffect, useRef } from "react"
import journalHomeMobileImage from "../../../assets/landing/01a-journal-home-top-mobile.PNG"
import appleIcon from "../../../assets/landing/apple-icon.png"
import googlePlayIcon from "../../../assets/landing/google-play-icon.png"
import journalHomeImage from "../../../assets/landing/01a-journal-home-top.PNG"
import type { Locale } from "../../../types/landing"
import { HeroPhone } from "../HeroPhone"

type HeroSectionProps = {
  appStoreAriaLabel: string
  eyebrow: string
  googlePlayAriaLabel: string
  leadLines: readonly string[]
  locale: Locale
  screenAlt: string
  titleLines: readonly string[]
}

const appStoreUrl =
  "https://apps.apple.com/tt/app/%EC%98%99%EB%B2%84%EB%94%94/id6768154123"

export function HeroSection({
  appStoreAriaLabel,
  eyebrow,
  googlePlayAriaLabel,
  leadLines,
  locale,
  screenAlt,
  titleLines,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const leadRef = useRef<HTMLParagraphElement>(null)
  const actionRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const phoneMotionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const eyebrowElement = eyebrowRef.current
    const headingElement = headingRef.current
    const leadElement = leadRef.current
    const phoneElement = phoneMotionRef.current
    const actionElements = actionRefs.current.filter(
      (action): action is HTMLAnchorElement => action !== null,
    )

    if (
      !section ||
      !eyebrowElement ||
      !headingElement ||
      !leadElement ||
      !phoneElement ||
      actionElements.length !== 2
    ) {
      return
    }

    let cancelled = false
    let animationMedia: { revert: () => void } | undefined

    const setupAnimation = async () => {
      const { gsap } = await import("gsap")
      if (cancelled) return

      const media = gsap.matchMedia(section)
      animationMedia = media
      media.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          if (context.conditions?.reduced) return

          gsap
            .timeline({ defaults: { ease: "power2.out" } })
            .from(eyebrowElement, { autoAlpha: 0, duration: 0.45, y: 16 })
            .from(headingElement, { autoAlpha: 0, duration: 0.78, y: 28 }, "-=0.24")
            .from(leadElement, { autoAlpha: 0, duration: 0.55, y: 18 }, "-=0.4")
            .from(
              actionElements,
              { autoAlpha: 0, duration: 0.5, stagger: 0.08, y: 16 },
              "-=0.3",
            )
            .from(
              phoneElement,
              { autoAlpha: 0, duration: 0.82, scale: 0.96, y: 40 },
              "-=0.32",
            )
        },
      )
    }

    void setupAnimation()

    return () => {
      cancelled = true
      animationMedia?.revert()
    }
  }, [])

  const storeActions = [
    {
      ariaLabel: appStoreAriaLabel,
      href: appStoreUrl,
      icon: appleIcon,
      iconClassName: "h-5 w-5 brightness-0 invert",
      label: "App Store",
    },
    {
      ariaLabel: googlePlayAriaLabel,
      href: `https://play.google.com/store/apps/details?id=com.juhun.yepbuddy.app&hl=${locale}`,
      icon: googlePlayIcon,
      iconClassName: "h-4.75 w-4.75",
      label: "Google Play",
    },
  ] as const

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="relative flex min-h-0 flex-col overflow-hidden bg-hero px-page-mobile pt-15.5 text-center phone:min-h-[calc(100svh-64px)] phone:px-page phone:pt-22.5 desktop:pt-24"
      data-landing-section="hero"
      id="hero"
    >
      <div className="relative z-10 mx-auto w-full max-w-hero-copy">
        <p
          ref={eyebrowRef}
          className="mb-3.5 text-eyebrow-mobile font-heavy tracking-[-0.01em] text-brand phone:mb-4.5 phone:text-eyebrow"
        >
          {eyebrow}
        </p>
        <h1
          ref={headingRef}
          id="hero-title"
          className="m-0 break-keep text-hero-mobile font-heavy text-ink phone:text-[clamp(3rem,8vw,4rem)] desktop:text-hero"
        >
          {titleLines.map((line, index) => (
            <span className="block" key={`${index}-${line}`}>
              {line}
            </span>
          ))}
        </h1>
        <p
          ref={leadRef}
          className="mx-auto mt-5 max-w-lead break-keep text-body-lg-mobile text-ink-secondary phone:mt-6 phone:text-[18px] phone:leading-[1.72]"
        >
          {leadLines.map((line, index) => (
            <span className="phone:block" key={`${index}-${line}`}>
              {line}
              {index < leadLines.length - 1 ? " " : null}
            </span>
          ))}
        </p>
        <div className="mt-6.5 flex justify-center gap-2 phone:mt-7.5 phone:gap-2.5">
          {storeActions.map((action, index) => (
            <a
              ref={(element) => {
                actionRefs.current[index] = element
              }}
              aria-label={action.ariaLabel}
              className="inline-flex min-h-12 min-w-0 items-center justify-center gap-2.5 rounded-action bg-ink/90 px-3.75 text-sm font-bold text-white no-underline shadow-action transition-[background-color,transform] duration-fast hover:-translate-y-0.5 hover:bg-ink focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-3 phone:min-w-37.5 phone:px-5 phone:text-[15px]"
              href={action.href}
              key={action.label}
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                alt=""
                aria-hidden="true"
                className={`block object-contain ${action.iconClassName}`}
                height="20"
                src={action.icon}
                width="20"
              />
              {action.label}
            </a>
          ))}
        </div>
      </div>

      <div className="relative z-1 -mx-page-mobile mt-6 grid min-h-125 w-[calc(100%+2.25rem)] flex-[1_0_500px] place-items-center overflow-hidden phone:-mx-page phone:mt-7 phone:min-h-150 phone:w-[calc(100%+3rem)] phone:flex-[1_0_600px]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-70 left-1/2 h-152.5 w-170 -translate-x-1/2 rounded-[50%] bg-white/55 phone:-bottom-87.5 phone:h-205 phone:w-[min(1100px,90vw)]"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 left-1/2 aspect-square w-107.5 -translate-x-1/2 rounded-full border border-brand/12 phone:-bottom-22 phone:w-[min(620px,68vw)]"
        />
        <div ref={phoneMotionRef} className="relative z-2">
          <HeroPhone
            imageAlt={screenAlt}
            imageSrc={journalHomeImage}
            mobileImageSrc={journalHomeMobileImage}
          />
        </div>
      </div>
    </section>
  )
}
