const fs = require("node:fs")
const path = require("node:path")
const {
  withDangerousMod,
  withEntitlementsPlist,
  withXcodeProject,
} = require("@expo/config-plugins")
const plist = require("@expo/plist").default

// Expo prebuild 때 앱 타깃에 함께 포함되어야 하는 네이티브 브리지 파일
const MODULE_FILES = ["YBWorkoutSession.swift", "YBWorkoutSessionBridge.m"]

// Expo/RN 버전에 따라 앱 PBXGroup 이름이 projectName 또는 app으로 잡힐 수 있어 fallback
function findAppGroup(project, projectName) {
  return (
    project.findPBXGroupKey({ name: projectName }) ??
    project.findPBXGroupKey({ path: projectName }) ??
    project.findPBXGroupKey({ name: "app" }) ??
    project.findPBXGroupKey({ path: "app" })
  )
}

// react-native-health가 만든 entitlement를 Apple이 기대하는 최종 형태로 정리
function normalizeHealthKitEntitlements(entitlements) {
  const healthKitAccess = entitlements["com.apple.developer.healthkit.access"]

  entitlements["com.apple.developer.healthkit"] = true

  // 세부 access 값이 없는 빈 배열은 plist에 남겨도 의미가 없고 capability diff만 흐림
  if (Array.isArray(healthKitAccess) && healthKitAccess.length === 0) {
    delete entitlements["com.apple.developer.healthkit.access"]
  }
}

// 첫 prebuild 전에는 entitlements 파일이 아직 없을 수 있음
function normalizeHealthKitEntitlementsFile(entitlementsPath) {
  if (!fs.existsSync(entitlementsPath)) {
    return
  }

  const entitlements = plist.parse(fs.readFileSync(entitlementsPath, "utf8"))
  normalizeHealthKitEntitlements(entitlements)
  fs.writeFileSync(entitlementsPath, plist.build(entitlements))
}

// config plugin 체인의 메모리상 entitlements를 먼저 보정
module.exports = function withYBWorkoutSession(config) {
  config = withEntitlementsPlist(config, (config) => {
    normalizeHealthKitEntitlements(config.modResults)

    return config
  })

  config = withDangerousMod(config, [
    "ios",
    (config) => {
      const entitlementsPath = path.join(
        config.modRequest.platformProjectRoot,
        config.modRequest.projectName,
        `${config.modRequest.projectName}.entitlements`,
      )

      // 이미 생성된 ios 프로젝트를 다시 prebuild하는 경로도 같은 entitlement 형태
      normalizeHealthKitEntitlementsFile(entitlementsPath)

      return config
    },
  ])

  return withXcodeProject(config, (config) => {
    const project = config.modResults
    const projectName = config.modRequest.projectName
    const iosRoot = config.modRequest.platformProjectRoot
    const sourceRoot = path.join(config.modRequest.projectRoot, "plugins", "ios")
    const appRoot = path.join(iosRoot, projectName)
    const appGroup = findAppGroup(project, projectName)
    const target = project.getFirstTarget().uuid
    const entitlementsPath = path.join(
      iosRoot,
      projectName,
      `${projectName}.entitlements`,
    )

    if (!appGroup) {
      throw new Error(`Unable to find iOS app group for ${projectName}`)
    }

    fs.mkdirSync(appRoot, { recursive: true })

    for (const fileName of MODULE_FILES) {
      // 원본은 plugins/ios에 두고, prebuild 산출물인 ios 앱 디렉터리로 복사해 Xcode가 빌드
      const sourcePath = path.join(sourceRoot, fileName)
      const destinationPath = path.join(appRoot, fileName)
      const projectPath = `${projectName}/${fileName}`

      fs.copyFileSync(sourcePath, destinationPath)

      // prebuild를 반복해도 Xcode project에 같은 source file reference가 중복 등록X
      if (!project.hasFile(projectPath)) {
        project.addSourceFile(projectPath, { target }, appGroup)
      }
    }

    // Xcode project mod 이후 실제 entitlements 파일 상태를 마지막으로 한 번 더 정규화한다.
    normalizeHealthKitEntitlementsFile(entitlementsPath)

    return config
  })
}
