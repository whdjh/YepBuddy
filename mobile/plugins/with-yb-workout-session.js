const fs = require("node:fs")
const path = require("node:path")
const {
  withDangerousMod,
  withEntitlementsPlist,
  withXcodeProject,
} = require("@expo/config-plugins")
const plist = require("@expo/plist").default

// Expo prebuild 앱 타깃 네이티브 브리지 파일
const MODULE_FILES = ["YBWorkoutSession.swift", "YBWorkoutSessionBridge.m"]

// Expo/RN PBXGroup 이름 fallback
function findAppGroup(project, projectName) {
  return (
    project.findPBXGroupKey({ name: projectName }) ??
    project.findPBXGroupKey({ path: projectName }) ??
    project.findPBXGroupKey({ name: "app" }) ??
    project.findPBXGroupKey({ path: "app" })
  )
}

// react-native-health HealthKit entitlement 최종 형태 정규화
function normalizeHealthKitEntitlements(entitlements) {
  const healthKitAccess = entitlements["com.apple.developer.healthkit.access"]

  entitlements["com.apple.developer.healthkit"] = true

  // 빈 HealthKit access 배열 제거
  if (Array.isArray(healthKitAccess) && healthKitAccess.length === 0) {
    delete entitlements["com.apple.developer.healthkit.access"]
  }
}

// 첫 prebuild 전 entitlements 파일 부재 허용
function normalizeHealthKitEntitlementsFile(entitlementsPath) {
  if (!fs.existsSync(entitlementsPath)) {
    return
  }

  const entitlements = plist.parse(fs.readFileSync(entitlementsPath, "utf8"))
  normalizeHealthKitEntitlements(entitlements)
  fs.writeFileSync(entitlementsPath, plist.build(entitlements))
}

// config plugin 체인 메모리상 entitlements 선보정
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

      // 기존 ios 프로젝트 재 prebuild 경로 entitlement 보정
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
      // plugins/ios 원본 파일의 prebuild 산출물 복사
      const sourcePath = path.join(sourceRoot, fileName)
      const destinationPath = path.join(appRoot, fileName)
      const projectPath = `${projectName}/${fileName}`

      fs.copyFileSync(sourcePath, destinationPath)

      // 반복 prebuild 시 Xcode source file reference 중복 등록 방지
      if (!project.hasFile(projectPath)) {
        project.addSourceFile(projectPath, { target }, appGroup)
      }
    }

    // Xcode project mod 이후 실제 entitlements 파일 최종 정규화
    normalizeHealthKitEntitlementsFile(entitlementsPath)

    return config
  })
}
