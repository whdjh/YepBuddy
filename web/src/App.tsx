import { HomePage } from "./pages/HomePage"
import { PrivacyPage } from "./pages/PrivacyPage"
import { SupportPage } from "./pages/SupportPage"
import { parseLocaleAndRoute, switchLocalePath, texts } from "./i18n"

function App() {
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
