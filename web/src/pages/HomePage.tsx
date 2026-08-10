import { PageLayout } from "../components/PageLayout"
import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

export function HomePage({ locale, switchTo, text }: PageProps) {
  const strings = text.home

  return (
    <PageLayout locale={locale} text={text} switchTo={switchTo}>
      <h1 className="mb-6 text-section font-heavy text-ink">{strings.title}</h1>
      <p className="text-body text-ink-secondary">{strings.description}</p>

      <section className="mt-12 border-t border-line pt-8">
        <p className="mb-3 text-caption font-bold tracking-[0.06em] text-brand">
          {strings.hero.eyebrow}
        </p>
        <h2 className="mb-4 text-feature font-bold text-ink">{strings.hero.title}</h2>
        <p className="mb-6 text-body-lg text-ink-secondary">{strings.hero.lead}</p>
        <p className="flex flex-wrap gap-5 text-body font-semibold">
          <a
            className="text-brand underline-offset-4 transition-colors duration-fast hover:text-brand-hover"
            href={pathWithLocale(locale, "/")}
          >
            {strings.hero.ctaPrimary}
          </a>
          <a
            className="text-brand underline-offset-4 transition-colors duration-fast hover:text-brand-hover"
            href={pathWithLocale(locale, "/support")}
          >
            {strings.hero.ctaSecondary}
          </a>
        </p>
      </section>

      <section className="mt-12 border-t border-line pt-8">
        {strings.features.map((feature) => (
          <section className="border-b border-line py-6" key={feature.title}>
            <h2 className="mb-2 text-2xl font-bold tracking-[-0.035em] text-ink">
              {feature.title}
            </h2>
            <p className="text-body text-ink-secondary">{feature.detail}</p>
          </section>
        ))}
      </section>

      <section className="mt-12 rounded-visual bg-surface p-8">
        <p className="mb-4 text-2xl font-bold tracking-[-0.035em] text-ink">
          {strings.final.text}
        </p>
        <p className="text-body font-semibold">
          <a
            className="text-brand underline-offset-4 transition-colors duration-fast hover:text-brand-hover"
            href={pathWithLocale(locale, "/")}
          >
            {strings.final.cta}
          </a>
        </p>
      </section>

      <p className="mt-8 flex gap-5 text-caption text-ink-tertiary">
        <a className="hover:text-ink" href={pathWithLocale(locale, "/privacy")}>
          {text.header.privacy}
        </a>
        <a className="hover:text-ink" href={pathWithLocale(locale, "/support")}>
          {text.header.support}
        </a>
      </p>
    </PageLayout>
  )
}
