import { SiteHeader } from "../components/SiteHeader"
import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

export function PrivacyPage({ locale, switchTo, text }: PageProps) {
  const strings = text.privacy

  return (
    <>
      <SiteHeader locale={locale} text={text} switchTo={switchTo} />
      <main>
        <p className="date">
          {strings.updatedLabel}: {strings.updatedAt}
        </p>
        <h1>{strings.title}</h1>

        {strings.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.content?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {section.note ? <p>{section.note}</p> : null}
          </section>
        ))}

        <section>
          <h2>{strings.contactEmailLabel}</h2>
          <p>
            <a href={`mailto:${strings.contactEmail}`}>{strings.contactEmail}</a>
          </p>
        </section>

        <section>
          <h2>{text.header.support}</h2>
          <p>
            <a href={pathWithLocale(locale, "/support")}>{text.header.support}</a>
          </p>
        </section>
      </main>
    </>
  )
}
