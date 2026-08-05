import ko from "./locales/ko.json"
import en from "./locales/en.json"
import type { Locale } from "../types/landing"

export const texts = {
  ko: ko,
  en: en,
}

export type AppText = (typeof texts)["ko"]

export const parseLocaleAndRoute = (pathname: string): { locale: Locale; route: string } => {
  const path = pathname
  if (path === "/en" || path.startsWith("/en/")) {
    return { locale: "en", route: path.slice(3) || "/" }
  }
  return { locale: "ko", route: path || "/" }
}

export const pathWithLocale = (locale: Locale, route: string) =>
  locale === "ko" ? route : `/en${route}`

export const switchLocalePath = (locale: Locale, route: string) =>
  locale === "ko" ? (route === "/" ? "/en" : `/en${route}`) : route
