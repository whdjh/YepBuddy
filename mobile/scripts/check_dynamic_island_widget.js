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
    /compactLeading:\s*\{[\s\S]*figure\.strengthtraining\.traditional[\s\S]*\}\s*compactTrailing:/,
    "compact leading must stay status-only with the strength icon",
  )

  requirePattern(
    /compactTrailing:\s*\{\s*EmptyView\(\)[\s\S]*\.accessibilityHidden\(true\)/,
    "compact trailing must stay empty to avoid visually lengthening the island",
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

if (process.exitCode) {
  process.exit()
}

console.log("Live Activity widget contract passed")
