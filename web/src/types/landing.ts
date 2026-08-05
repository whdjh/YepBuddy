import type { AppText } from "../i18n"

export type Locale = "ko" | "en"

export type PageProps = {
  locale: Locale
  switchTo: string
  text: AppText
}
