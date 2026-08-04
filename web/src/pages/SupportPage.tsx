import { PageLayout } from "../components/PageLayout"
import type { PageProps } from "../types/landing"
import { pathWithLocale } from "../i18n"

export function SupportPage({ locale, switchTo, text }: PageProps) {
  const strings = text.support

  return (
    <PageLayout locale={locale} text={text} switchTo={switchTo}>
      <p className="date">{text.header.support}</p>
      <h1>{strings.title}</h1>

      <section>
        <h2>{strings.contactEmailLabel}</h2>
        <p>{strings.contactIntro}</p>
        <p>
          <a href={`mailto:${strings.contactEmail}`}>{strings.contactEmail}</a>
        </p>
      </section>

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
        </section>
      ))}

      <section>
        <h2>{text.header.privacy}</h2>
        <p>
          <a href={pathWithLocale(locale, "/privacy")}>{text.header.privacy}</a>
        </p>
      </section>
    </PageLayout>
  )
}
