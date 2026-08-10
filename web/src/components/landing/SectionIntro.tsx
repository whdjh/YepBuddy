import { useEffect, useRef } from "react"

type SectionIntroProps = {
  eyebrow: string
  headingId: string
  headingLevel?: "h1" | "h2"
  titleLines: readonly string[]
}

export function SectionIntro({
  eyebrow,
  headingId,
  headingLevel = "h2",
  titleLines,
}: SectionIntroProps) {
  const Heading = headingLevel
  const headerRef = useRef<HTMLElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const header = headerRef.current
    const eyebrowElement = eyebrowRef.current
    const headingElement = headingRef.current

    if (!header || !eyebrowElement || !headingElement) return

    let cancelled = false
    let animationMedia: { revert: () => void } | undefined

    const setupAnimation = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ])
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)
      const media = gsap.matchMedia(header)
      animationMedia = media
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: header, start: "top 72%", once: true },
          })
          .from(eyebrowElement, { autoAlpha: 0, duration: 0.45, y: 16 })
          .from(headingElement, { autoAlpha: 0, duration: 0.78, y: 28 }, "-=0.24")
      })
    }

    void setupAnimation()

    return () => {
      cancelled = true
      animationMedia?.revert()
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className="max-w-intro py-section-mobile desktop:py-section"
    >
      <p
        ref={eyebrowRef}
        className="mb-4.5 text-eyebrow-mobile font-bold text-brand phone:text-eyebrow"
      >
        {eyebrow}
      </p>
      <Heading
        ref={headingRef}
        id={headingId}
        className="m-0 break-keep text-section-mobile font-heavy text-ink desktop:text-section-compact"
      >
        {titleLines.map((line, index) => (
          <span className="block" key={`${index}-${line}`}>
            {line}
          </span>
        ))}
      </Heading>
    </header>
  )
}
