import { HomePage } from "./pages/HomePage"
import { PrivacyPage } from "./pages/PrivacyPage"
import { SupportPage } from "./pages/SupportPage"
import { useEffect } from "react"
import { parseLocaleAndRoute, switchLocalePath, texts } from "./i18n"

function App() {
  /** 다크모드/라이트모드 변환 훅 */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const syncTheme = () => {
      document.documentElement.classList.toggle("dark", mediaQuery.matches)
    }

    syncTheme()
    mediaQuery.addEventListener("change", syncTheme)

    return () => mediaQuery.removeEventListener("change", syncTheme)
  }, [])

  const { locale, route } = parseLocaleAndRoute(window.location.pathname)
  const t = texts[locale]
  const switchPath = switchLocalePath(locale, route)

  const common = {
    locale,
    switchTo: switchPath,
    text: t,
  }

  if (route === "/support") {
    return <SupportPage {...common} />
  }

  if (route === "/privacy") {
    return <PrivacyPage {...common} />
  }

  return <HomePage {...common} />
}

export default App
