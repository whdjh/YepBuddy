const fs = require("fs")
const path = require("path")

const pluginPath = path.join(__dirname, "..", "plugins", "with-workout-session.js")
const source = fs.readFileSync(pluginPath, "utf8")
const appConfigPath = path.join(__dirname, "..", "app.json")
const appConfig = JSON.parse(fs.readFileSync(appConfigPath, "utf8"))
const iosBundleIdentifier = appConfig.expo?.ios?.bundleIdentifier
const appleTeamId = "U9H4YARLH8"
const liveActivityTarget = "WorkoutLiveActivityExtension"
const liveActivityBundleIdentifier = `${iosBundleIdentifier}.${liveActivityTarget}`

function fail(message) {
  console.error(`Workout session config plugin contract failed: ${message}`)
  process.exit(1)
}

if (!source.includes("settings.OTHER_SWIFT_FLAGS")) {
  fail("Live Activity extension Swift flags are not configured")
}

if (
  /settings\.OTHER_SWIFT_FLAGS\s*=\s*\n\s*"\$\(inherited\) -D WORKOUT_LIVE_ACTIVITY_EXTENSION"/.test(
    source,
  )
) {
  fail("OTHER_SWIFT_FLAGS must be quoted for Xcode project serialization")
}

if (
  !/settings\.OTHER_SWIFT_FLAGS\s*=\s*\n\s*'"\$\(inherited\) -D WORKOUT_LIVE_ACTIVITY_EXTENSION"'/.test(
    source,
  )
) {
  fail("OTHER_SWIFT_FLAGS must serialize as a quoted pbxproj string")
}

if (!/settings\.DEVELOPMENT_TEAM\s*=\s*appleTeamId/.test(source)) {
  fail("Live Activity extension build settings must include DEVELOPMENT_TEAM")
}

if (!/DevelopmentTeam:\s*appleTeamId/.test(source)) {
  fail("Live Activity extension target attributes must include DevelopmentTeam")
}

const workoutSessionPlugin = appConfig.expo?.plugins?.find(
  (plugin) => Array.isArray(plugin) && plugin[0] === "./plugins/with-workout-session",
)

if (workoutSessionPlugin?.[1]?.appleTeamId !== appleTeamId) {
  fail("Workout session plugin must receive the Apple team ID")
}

const appExtensions =
  appConfig.expo?.extra?.eas?.build?.experimental?.ios?.appExtensions ?? []
const liveActivityExtension = appExtensions.find(
  (extension) => extension.targetName === liveActivityTarget,
)

if (!liveActivityExtension) {
  fail("EAS appExtensions must declare the Live Activity extension target")
}

if (liveActivityExtension.bundleIdentifier !== liveActivityBundleIdentifier) {
  fail("EAS appExtensions must use the Live Activity extension bundle identifier")
}

if (liveActivityExtension.parentBundleIdentifier !== iosBundleIdentifier) {
  fail("EAS appExtensions must point to the parent iOS bundle identifier")
}

console.log("Workout session config plugin contract passed")
