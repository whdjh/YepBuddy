const fs = require("fs")
const path = require("path")

const widgetPaths = [
  path.join(
    __dirname,
    "..",
    "plugins",
    "ios",
    "workout-live-activity",
    "WorkoutLiveActivityWidget.swift",
  ),
  path.join(
    __dirname,
    "..",
    "ios",
    "WorkoutLiveActivityExtension",
    "WorkoutLiveActivityWidget.swift",
  ),
]
const workoutContextPath = path.join(
  __dirname,
  "..",
  "src",
  "entities",
  "workout-session",
  "model",
  "WorkoutContext.tsx",
)
const liveActivityApiPath = path.join(
  __dirname,
  "..",
  "src",
  "entities",
  "workout-session",
  "api",
  "liveActivity.ts",
)
const workoutSessionModulePaths = [
  path.join(
    __dirname,
    "..",
    "plugins",
    "ios",
    "workout-session",
    "WorkoutSessionModule.swift",
  ),
  path.join(
    __dirname,
    "..",
    "ios",
    "app",
    "WorkoutSessionModule.swift",
  ),
]

let currentLabel = ""
let source = ""

function fail(message) {
  console.error(`Live Activity widget contract failed (${currentLabel}): ${message}`)
  process.exitCode = 1
}

function requirePattern(pattern, message) {
  if (!pattern.test(source)) {
    fail(message)
  }
}

function sectionBetween(startPattern, endPattern, message) {
  const start = source.search(startPattern)
  if (start === -1) {
    fail(message)
    return ""
  }

  const afterStart = source.slice(start)
  const end = afterStart.search(endPattern)
  if (end === -1) {
    fail(message)
    return ""
  }

  return afterStart.slice(0, end)
}

function rejectPatternInSection(section, pattern, message) {
  if (pattern.test(section)) {
    fail(message)
  }
}

for (const widgetPath of widgetPaths) {
  if (!fs.existsSync(widgetPath)) {
    continue
  }

  currentLabel = path.relative(path.join(__dirname, ".."), widgetPath)
  source = fs.readFileSync(widgetPath, "utf8")

  requirePattern(
    /struct\s+WorkoutLiveActivityActions:\s+View/,
    "shared WorkoutLiveActivityActions view is missing",
  )

  requirePattern(
    /DynamicIslandExpandedRegion\(\.bottom\)\s*\{[\s\S]*WorkoutLiveActivityActions\(/,
    "expanded Dynamic Island bottom must render shared workout actions",
  )

  requirePattern(
    /Button\(intent:\s*StartCardioWorkoutLiveActivityIntent/,
    "start cardio intent button is missing",
  )

  requirePattern(
    /Button\(intent:\s*PauseWorkoutLiveActivityIntent/,
    "pause intent button is missing",
  )

  requirePattern(
    /Button\(intent:\s*ResumeWorkoutLiveActivityIntent/,
    "resume intent button is missing",
  )

  requirePattern(
    /Button\(intent:\s*FinishWorkoutLiveActivityIntent/,
    "finish intent button is missing",
  )

  requirePattern(
    /compactLeading:\s*\{[\s\S]*compactSystemName[\s\S]*cardioStartedAt[\s\S]*figure\.run[\s\S]*\}\s*compactTrailing:/,
    "compact leading must switch between strength and cardio icons",
  )

  requirePattern(
    /compactTrailing:\s*\{[\s\S]*heartRate\s*>\s*0[\s\S]*WorkoutLiveActivityHeartRateText/,
    "compact trailing must show a positive current heart rate",
  )

  requirePattern(
    /struct\s+WorkoutLiveActivityHeartRateText:\s+View[\s\S]*heart\.fill[\s\S]*BPM/,
    "shared heart rate view is missing",
  )

  requirePattern(
    /WorkoutLiveActivityLockScreenView[\s\S]*heartRate\s*>\s*0[\s\S]*WorkoutLiveActivityHeartRateText/,
    "Lock Screen Live Activity must show a positive current heart rate",
  )

  requirePattern(
    /DynamicIslandExpandedRegion\(\.leading\)\s*\{[\s\S]*\.padding\(\.leading,\s*14\)/,
    "expanded leading content must include edge padding",
  )

  requirePattern(
    /DynamicIslandExpandedRegion\(\.trailing\)\s*\{[\s\S]*\.padding\(\.trailing,\s*14\)/,
    "expanded trailing content must include edge padding",
  )

  requirePattern(
    /DynamicIslandExpandedRegion\(\.bottom\)\s*\{[\s\S]*\.padding\(\.horizontal,\s*24\)/,
    "expanded bottom actions must include horizontal padding",
  )

  requirePattern(
    /\.contentMargins\(\.all,\s*16,\s*for:\s*\.expanded\)/,
    "expanded Dynamic Island must use system content margins",
  )

  requirePattern(
    /minimal:\s*\{[\s\S]*minimalSystemName[\s\S]*\}/,
    "minimal presentation must use status icon selection without command buttons",
  )

  const compactLeadingSection = sectionBetween(
    /compactLeading:\s*\{/,
    /\}\s*compactTrailing:/,
    "compact leading section is missing",
  )
  const compactTrailingSection = sectionBetween(
    /compactTrailing:\s*\{/,
    /\}\s*minimal:/,
    "compact trailing section is missing",
  )
  const minimalSection = sectionBetween(
    /minimal:\s*\{/,
    /\}\s*\.keylineTint/,
    "minimal section is missing",
  )
  const expandedTrailingSection = sectionBetween(
    /DynamicIslandExpandedRegion\(\.trailing\)\s*\{/,
    /DynamicIslandExpandedRegion\(\.bottom\)\s*\{/,
    "expanded trailing section is missing",
  )

  requirePattern(
    /DynamicIslandExpandedRegion\(\.trailing\)[\s\S]*heartRate\s*>\s*0[\s\S]*WorkoutLiveActivityHeartRateText/,
    "expanded Dynamic Island must show a positive current heart rate",
  )

  rejectPatternInSection(
    compactLeadingSection,
    /Button\s*\(/,
    "compact leading must not expose command buttons",
  )
  rejectPatternInSection(
    compactTrailingSection,
    /Button\s*\(/,
    "compact trailing must not expose command buttons",
  )
  rejectPatternInSection(
    minimalSection,
    /Button\s*\(/,
    "minimal presentation must not expose command buttons",
  )
  rejectPatternInSection(
    expandedTrailingSection,
    /figure\.strengthtraining\.traditional/,
    "expanded trailing should not show the redundant strength icon",
  )
}

currentLabel = path.relative(path.join(__dirname, ".."), workoutContextPath)
source = fs.readFileSync(workoutContextPath, "utf8")
requirePattern(
  /startWorkoutLiveActivity\(\{[\s\S]*heartRate:\s*state\.heartRate/,
  "foreground Live Activity updates must pass the current heart rate",
)
requirePattern(
  /state\.cardioStartedAt,\s*state\.heartRate,\s*state\.pausedAt/,
  "heart rate must trigger foreground Live Activity updates",
)

currentLabel = path.relative(path.join(__dirname, ".."), liveActivityApiPath)
source = fs.readFileSync(liveActivityApiPath, "utf8")
requirePattern(
  /startLiveActivity\?:\s*\([\s\S]*heartRate:\s*number\s*\|\s*null/,
  "the React Native Live Activity bridge must accept heart rate",
)
requirePattern(
  /\.startLiveActivity\([\s\S]*params\.cardioStartedAt,\s*params\.heartRate,/,
  "the React Native Live Activity bridge must forward heart rate",
)

for (const modulePath of workoutSessionModulePaths) {
  if (!fs.existsSync(modulePath)) {
    continue
  }

  currentLabel = path.relative(path.join(__dirname, ".."), modulePath)
  source = fs.readFileSync(modulePath, "utf8")
  requirePattern(
    /controller\.onStats\s*=\s*\{[\s\S]*stats\["heartRate"\][\s\S]*WorkoutLiveActivityController\.updateHeartRate/,
    "native workout stats must update Live Activity heart rate while locked",
  )
}

if (process.exitCode) {
  process.exit()
}

console.log("Live Activity widget contract passed")
