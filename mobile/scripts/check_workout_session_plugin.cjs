const fs = require("fs")
const path = require("path")

const pluginPath = path.join(__dirname, "..", "plugins", "with-workout-session.js")
const source = fs.readFileSync(pluginPath, "utf8")

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

console.log("Workout session config plugin contract passed")
