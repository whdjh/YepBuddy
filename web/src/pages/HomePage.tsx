import { PageLayout } from "../components/PageLayout"
import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

export function HomePage({ locale, switchTo, text }: PageProps) {
  const strings = text.home

  return (
    <PageLayout locale={locale} text={text} switchTo={switchTo}>
      <h1>{strings.title}</h1>
      <p>{strings.description}</p>

      <section>
        <p className="date">{strings.hero.eyebrow}</p>
        <h2>{strings.hero.title}</h2>
        <p>{strings.hero.lead}</p>
        <p>
          <a href={pathWithLocale(locale, "/")}>{strings.hero.ctaPrimary}</a>
          <a href={pathWithLocale(locale, "/support")}>{strings.hero.ctaSecondary}</a>
        </p>
      </section>

      <section>
        {strings.features.map((feature) => (
          <section key={feature.title}>
            <h2>{feature.title}</h2>
            <p>{feature.detail}</p>
          </section>
        ))}
      </section>

      <section>
        <p>{strings.final.text}</p>
        <p>
          <a href={pathWithLocale(locale, "/")}>{strings.final.cta}</a>
        </p>
      </section>

      <p>
        <a href={pathWithLocale(locale, "/privacy")}>{text.header.privacy}</a>
        <a href={pathWithLocale(locale, "/support")}>{text.header.support}</a>
      </p>
    </PageLayout>
  )
}
