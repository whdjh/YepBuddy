export function HistorySection() {
  return (
    <section
      className="relative min-h-[calc(410svh+330px)] bg-surface desktop:min-h-[calc(410svh+340px)]"
      data-landing-section="history"
      id="history"
    >
      <p
        aria-hidden="true"
        className="absolute top-4 left-page-mobile text-caption text-ink-tertiary phone:left-page"
      >
        지난 기록 섹션
      </p>
    </section>
  )
}
