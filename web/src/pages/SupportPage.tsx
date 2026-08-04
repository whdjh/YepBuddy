import { SiteHeader } from "../components/SiteHeader"

type SupportPageProps = {
  supportEmail: string
}

export function SupportPage({ supportEmail }: SupportPageProps) {
  return (
    <>
      <SiteHeader />
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
            account deletion flow because no account is created. Device-stored
            data can be deleted as described in the{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2>Permissions</h2>
          <ul>
            <li>HealthKit is requested when recording workouts.</li>
            <li>
              Foreground location is requested when starting a workout.
              Background location is requested only when the user enables
              workout place arrival reminders.
            </li>
            <li>Calendar is requested only after choosing Add to Calendar.</li>
            <li>Notifications are requested only after enabling alerts.</li>
          </ul>
        </section>

        <section>
          <h2>Purchases</h2>
          <p>
            YepBuddy may open external merchant pages for physical goods. The
            app does not sell digital goods, subscriptions, or in-app
            purchases.
          </p>
        </section>
      </main>
    </>
  )
}
