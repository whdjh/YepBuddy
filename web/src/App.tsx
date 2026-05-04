const supportEmail = "support@yepbuddy.app"

function App() {
  const path = window.location.pathname

  if (path === "/support") {
    return <SupportPage />
  }

  if (path === "/privacy") {
    return <PrivacyPage />
  }

  return <HomePage />
}

function Header() {
  return (
    <header>
      <a href="/">YepBuddy</a>
      <nav>
        <a href="/privacy">Privacy</a>
        <a href="/support">Support</a>
      </nav>
    </header>
  )
}

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <h1>YepBuddy</h1>
        <p>Support site for the YepBuddy iOS app.</p>
        <p>
          <a href="/privacy">Privacy Policy</a>
          {" · "}
          <a href="/support">Support</a>
        </p>
      </main>
    </>
  )
}

function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <p className="date">Last updated: May 5, 2026</p>
        <h1>Privacy Policy</h1>

        <section>
          <h2>Overview</h2>
          <p>
            YepBuddy is a workout logging app. The app does not require an
            account, does not include social features, and does not sell
            personal data.
          </p>
        </section>

        <section>
          <h2>Data We Use</h2>
          <ul>
            <li>
              Workout records, routine settings, and workout notes are stored on
              the user's device for workout history and summaries.
            </li>
            <li>
              HealthKit data is used only after the user grants Apple Health
              permission. YepBuddy reads workout and heart-rate related data for
              summaries and saves completed workouts to Apple Health.
            </li>
            <li>
              Location is requested during workout start to save one workout
              location for the result screen. Background location is not used.
            </li>
            <li>
              Calendar access is requested only when the user chooses to add a
              completed workout to the device calendar.
            </li>
            <li>
              Notifications are requested only when the user enables a
              notification feature, such as protein sale alerts. YepBuddy does
              not collect Expo push tokens.
            </li>
            <li>
              Protein reference data is loaded from Supabase. Users do not need
              to submit personal information to use this feature.
            </li>
          </ul>
        </section>

        <section>
          <h2>Third Parties</h2>
          <p>
            YepBuddy uses Supabase to host protein reference data. Product links
            may open Coupang or other merchant pages outside the app. Those
            services have their own privacy practices.
          </p>
        </section>

        <section>
          <h2>Health Data</h2>
          <p>
            HealthKit data is used only for health and fitness features in the
            app. It is not used for advertising, marketing, tracking, or data
            broker purposes.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For privacy questions, email{" "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </p>
        </section>
      </main>
    </>
  )
}

function SupportPage() {
  return (
    <>
      <Header />
      <main>
        <p className="date">Support</p>
        <h1>YepBuddy Support</h1>

        <section>
          <h2>Contact</h2>
          <p>
            For support, feedback, or privacy questions, email{" "}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </p>
        </section>

        <section>
          <h2>Accounts</h2>
          <p>
            YepBuddy does not have account creation or login. There is no
            account deletion flow because no account is created.
          </p>
        </section>

        <section>
          <h2>Permissions</h2>
          <ul>
            <li>HealthKit is requested when recording workouts.</li>
            <li>Location is requested when starting a workout.</li>
            <li>Calendar is requested only after choosing Add to Calendar.</li>
            <li>Notifications are requested only after enabling alerts.</li>
          </ul>
        </section>

        <section>
          <h2>Purchases</h2>
          <p>
            YepBuddy may open external merchant pages for physical goods. The
            app does not sell digital goods, subscriptions, or in-app purchases.
          </p>
        </section>
      </main>
    </>
  )
}

export default App
