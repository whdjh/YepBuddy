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
        <p>Support site for the YepBuddy iOS and Android app.</p>
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
        <p className="date">Last updated: July 15, 2026</p>
        <h1>Privacy Policy</h1>

        <section>
          <h2>Overview</h2>
          <p>
            YepBuddy is a workout logging app. The app does not require an
            account, does not include social features, and does not sell
            personal data. YepBuddy is developed by LeeJuHun.
          </p>
        </section>

        <section>
          <h2>Data We Use</h2>
          <ul>
            <li>
              Workout records, routine settings, workout notes, and a workout
              location are stored on the user's device for workout history,
              summaries, and reminders. This information is not sent to the
              developer's servers.
            </li>
            <li>
              HealthKit data is used only after the user grants Apple Health
              permission. YepBuddy reads workout and heart-rate related data for
              summaries and saves completed workouts to Apple Health.
            </li>
            <li>
              Foreground location is requested during workout start to save one
              workout location for the result screen. If the user separately
              enables workout place arrival reminders, background location is
              used to detect arrival and departure near places where the user
              has worked out repeatedly and to show a local notification.
              YepBuddy stores limited arrival/departure samples on the device
              to improve those reminders; it does not record a continuous route.
              The location data is not sent to the developer's servers.
            </li>
            <li>
              Calendar access is requested only when the user manually adds a
              completed workout or enables automatic calendar saving. A created
              event may contain workout times, title, body parts, notes, and a
              location label. YepBuddy may update or delete its linked event
              when the app record is edited or deleted.
            </li>
            <li>
              Notifications are requested only when the user enables a
              notification feature, such as protein sale alerts. YepBuddy does
              not collect Expo push tokens.
            </li>
            <li>
              Protein reference data is loaded from Supabase. A protein search
              term, selected product identifier, and query parameters may be
              sent to Supabase to return results, but workout, health, calendar,
              and location data is not uploaded. Users do not need to submit
              account or contact information to use this feature.
            </li>
            <li>
              If a user contacts the developer, the user's email address and
              message are received through the developer's email provider and
              used only to respond and handle the request.
            </li>
          </ul>
        </section>

        <section>
          <h2>Data Sharing and Security</h2>
          <p>
            YepBuddy does not sell personal data or use it for advertising or
            tracking. Device-stored workout, location, HealthKit, calendar, and
            notification data is not uploaded to developer-operated servers or
            Supabase. Apple Health, the device calendar, and operating-system
            location or geocoding services may process data only when the user
            enables the related feature. Device data is protected by the
            operating system's app sandbox, and requests for public protein
            reference data are encrypted in transit using HTTPS.
          </p>
        </section>

        <section>
          <h2>Third Parties</h2>
          <p>
            YepBuddy uses Supabase to host protein reference data. Product links
            may open Coupang or other merchant pages outside the app. Those
            services, the developer's email provider, and Netlify, which hosts
            this website, may process standard network or request information
            under their own privacy practices.
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
          <h2>Data Retention</h2>
          <ul>
            <li>
              Completed workout records, notes, and saved workout locations stay
              on the user's device until the user deletes the relevant workout,
              clears YepBuddy's app data, or uninstalls the app.
            </li>
            <li>
              An in-progress workout snapshot stays on the device until the
              workout is completed or discarded, app data is cleared, or the
              app is uninstalled. Routine and reminder preferences remain until
              the user changes them, clears app data, or uninstalls the app.
              Disabling workout place arrival reminders stops the registered
              geofences.
            </li>
            <li>
              Location-policy samples older than 14 days are excluded from use
              and removed from the stored sample set the next time a new sample
              is saved. Other locally stored workout-place data remains until
              the related workouts are deleted, app data is cleared, or the app
              is uninstalled.
            </li>
            <li>
              HealthKit workouts and device calendar events are stored by Apple
              Health and the device calendar under their own retention settings.
              YepBuddy does not keep a server copy of this data.
            </li>
            <li>
              The developer does not retain personal data on developer-operated
              servers because YepBuddy does not collect or transmit it there.
            </li>
            <li>
              Support and deletion-request emails are kept only as long as
              needed to respond, complete the request, and meet applicable legal
              or security obligations, then deleted.
            </li>
          </ul>
        </section>

        <section>
          <h2>Data Deletion</h2>
          <ul>
            <li>
              To delete one workout, open that workout's result screen in
              YepBuddy and use the trash button. If the workout is linked to a
              device calendar event, YepBuddy also attempts to delete that event.
              If the event cannot be deleted, the user may choose to delete only
              the app record and remove the remaining event in the calendar app.
            </li>
            <li>
              To delete all data stored by YepBuddy on the device, clear the
              app's storage in the device settings or uninstall the app.
            </li>
            <li>
              HealthKit data can be deleted in Apple Health, and calendar events
              can be deleted in the device calendar. These system records may
              remain after YepBuddy is uninstalled.
            </li>
          </ul>
          <p>
            YepBuddy has no user accounts and holds no server-side personal data,
            so there is no remote account-deletion procedure. For deletion help
            or to submit a data deletion request, email{" "}
            <a href={`mailto:${supportEmail}?subject=Data%20Deletion%20Request`}>
              {supportEmail}
            </a>{" "}
            with the subject "Data Deletion Request." The developer will explain
            the applicable device steps and confirm whether any developer-held
            data exists. Because the developer does not receive data stored only
            on the user's device, that local data cannot be erased remotely.
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
            app does not sell digital goods, subscriptions, or in-app purchases.
          </p>
        </section>
      </main>
    </>
  )
}

export default App
