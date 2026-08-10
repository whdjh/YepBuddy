import { PageLayout } from "../components/PageLayout"
import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

export function PrivacyPage({ locale, switchTo, text }: PageProps) {
  const strings = text.privacy

  return (
    <PageLayout locale={locale} text={text} switchTo={switchTo}>
      <p className="mb-3 text-caption font-bold tracking-[0.06em] text-brand">
        {strings.updatedLabel}: {strings.updatedAt}
      </p>
      <h1 className="mb-10 text-section-compact font-heavy text-ink">{strings.title}</h1>

      {strings.sections.map((section) => (
        <section className="mt-7 border-t border-line pt-6" key={section.title}>
          <h2 className="mb-3 text-2xl font-bold tracking-[-0.035em] text-ink">
            {section.title}
          </h2>
          {section.content?.map((paragraph) => (
            <p className="mb-4 text-body text-ink-secondary" key={paragraph}>
              {paragraph}
            </p>
          ))}
          {section.items ? (
            <ul className="list-disc space-y-2 pl-6 text-body text-ink-secondary marker:text-brand">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {section.note ? (
            <p className="mt-4 text-body text-ink-secondary">{section.note}</p>
          ) : null}
        </section>
      ))}

      <section className="mt-7 border-t border-line pt-6">
        <h2 className="mb-3 text-2xl font-bold tracking-[-0.035em] text-ink">
          {strings.contactEmailLabel}
        </h2>
        <p className="text-body">
          <a
            className="text-brand underline-offset-4 transition-colors duration-fast hover:text-brand-hover"
            href={`mailto:${strings.contactEmail}`}
          >
            {strings.contactEmail}
          </a>
        </p>
      </section>

      <section className="mt-7 border-t border-line pt-6">
        <h2 className="mb-3 text-2xl font-bold tracking-[-0.035em] text-ink">
          {text.header.support}
        </h2>
        <p className="text-body">
          <a
            className="text-brand underline-offset-4 transition-colors duration-fast hover:text-brand-hover"
            href={pathWithLocale(locale, "/support")}
          >
            {text.header.support}
          </a>
        </p>
      </section>
    </PageLayout>
  )
}
