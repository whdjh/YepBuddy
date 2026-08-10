export function HeroSection() {
  return (
    <section
      className="relative min-h-[calc(100svh-60px)] bg-hero phone:min-h-[calc(100svh-64px)]"
      data-landing-section="hero"
      id="hero"
    >
      <p
        aria-hidden="true"
        className="absolute top-4 left-page-mobile text-caption text-ink-tertiary phone:left-page"
      >
        히어로 섹션
      </p>
    </section>
  )
}
