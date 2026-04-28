import { createInstance } from "i18next"
import { initReactI18next } from "react-i18next"
import { getLocales } from "expo-localization"

import ko from "./locales/ko.json"
import en from "./locales/en.json"

const deviceLanguage = getLocales()[0]?.languageCode ?? "ko"

const i18n = createInstance()

i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
  },
  lng: deviceLanguage,
  fallbackLng: "ko",
  showSupportNotice: false,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
