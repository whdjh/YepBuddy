const fs = require("node:fs")
const path = require("node:path")

const appJson = require("./app.json")
// __dirname에 의존하지 않도록 app.json 위치를 기준으로 앱 경로를 계산합니다.
const appRoot = path.dirname(require.resolve("./app.json"))

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, "utf8")

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue

    const [, key, rawValue] = match
    if (process.env[key] != null) continue

    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2")
  }
}

// Expo CLI 실행 전에 로컬 env 파일을 읽어 공개 설정값으로 전달합니다.
loadEnvFile(path.resolve(appRoot, "../.env.local"))
loadEnvFile(path.resolve(appRoot, ".env.local"))

module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY,
    privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
    supportUrl: process.env.EXPO_PUBLIC_SUPPORT_URL,
  },
}
