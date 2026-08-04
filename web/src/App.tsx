import { HomePage } from "./pages/HomePage"
import { PrivacyPage } from "./pages/PrivacyPage"
import { SupportPage } from "./pages/SupportPage"

const supportEmail = "wngns9807@gmail.com"

function App() {
  return window.location.pathname === "/support" ? (
    <SupportPage supportEmail={supportEmail} />
  ) : window.location.pathname === "/privacy" ? (
    <PrivacyPage supportEmail={supportEmail} />
  ) : (
    <HomePage />
  )
}

export default App
