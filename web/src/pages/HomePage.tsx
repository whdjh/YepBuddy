import { SiteHeader } from "../components/SiteHeader"

export function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <h1>YepBuddy</h1>
        <p>Support site for the YepBuddy iOS and Android app.</p>
        <p>
          <a href="/privacy">Privacy Policy</a>
          <a href="/support">Support</a>
        </p>
      </main>
    </>
  )
}
