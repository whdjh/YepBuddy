const fs = require("node:fs")
const path = require("node:path")
const {
  withDangerousMod,
  withEntitlementsPlist,
  withInfoPlist,
  withXcodeProject,
} = require("@expo/config-plugins")
const plist = require("@expo/plist").default

// Expo prebuild 앱 타깃 네이티브 브리지 파일
const MODULE_FILES = [
  "WorkoutSessionModule.swift",
  "WorkoutSessionBridge.m",
  "LiveWorkoutSessionController.swift",
  "WorkoutSessionPayload.swift",
  "HealthKitWorkoutAuthorization.swift",
  "WorkoutLiveActivityAttributes.swift",
  "WorkoutLiveActivityController.swift",
]

const LIVE_ACTIVITY_EXTENSION_TARGET = "WorkoutLiveActivityExtension"
const LIVE_ACTIVITY_EXTENSION_FILES = [
  "WorkoutLiveActivityAttributes.swift",
  "WorkoutLiveActivityWidget.swift",
  "Info.plist",
]

// Expo/RN PBXGroup 이름 fallback
function findAppGroup(project, projectName) {
  return (
    project.findPBXGroupKey({ name: projectName }) ??
    project.findPBXGroupKey({ path: projectName }) ??
    project.findPBXGroupKey({ name: "app" }) ??
    project.findPBXGroupKey({ path: "app" })
  )
}

// PBXNativeTarget 이름 조회
function findNativeTargetUuid(project, targetName) {
  const targets = project.hash.project.objects.PBXNativeTarget ?? {}

  for (const [uuid, target] of Object.entries(targets)) {
    if (uuid.endsWith("_comment")) {
      continue
    }

    if (String(target.name).replace(/^"|"$/g, "") === targetName) {
      return uuid
    }
  }

  return null
}

// Xcode group을 main group 아래에 한 번만 추가
function ensureRootGroup(project, groupName, groupPath) {
  const existing =
    project.findPBXGroupKey({ name: groupName }) ??
    project.findPBXGroupKey({ path: groupPath })

  if (existing) {
    return existing
  }

  const group = project.addPbxGroup([], groupName, groupPath)
  const mainGroup =
    project.hash.project.objects.PBXGroup[
      project.getFirstProject().firstProject.mainGroup
    ]

  mainGroup.children.push({
    value: group.uuid,
    comment: groupName,
  })

  return group.uuid
}

// target build configuration UUID 목록
function getTargetBuildConfigurationUuids(project, targetUuid) {
  const target = project.hash.project.objects.PBXNativeTarget[targetUuid]
  const configurationList =
    project.hash.project.objects.XCConfigurationList[
      target.buildConfigurationList
    ]

  return configurationList.buildConfigurations.map((item) => item.value)
}

// Widget extension target build settings 정규화
function normalizeLiveActivityExtensionBuildSettings(
  project,
  targetUuid,
  bundleIdentifier,
  version,
  buildNumber,
) {
  const configurations = project.hash.project.objects.XCBuildConfiguration

  for (const uuid of getTargetBuildConfigurationUuids(project, targetUuid)) {
    const settings = configurations[uuid].buildSettings

    settings.CLANG_ENABLE_MODULES = "YES"
    settings.CODE_SIGN_STYLE = "Automatic"
    settings.CURRENT_PROJECT_VERSION = buildNumber
    settings.GENERATE_INFOPLIST_FILE = "NO"
    settings.INFOPLIST_FILE = `${LIVE_ACTIVITY_EXTENSION_TARGET}/Info.plist`
    settings.IPHONEOS_DEPLOYMENT_TARGET = 16.2
    settings.LD_RUNPATH_SEARCH_PATHS = [
      '"$(inherited)"',
      '"@executable_path/Frameworks"',
      '"@executable_path/../../Frameworks"',
    ]
    settings.MARKETING_VERSION = version
    settings.PRODUCT_BUNDLE_IDENTIFIER = bundleIdentifier
    settings.PRODUCT_NAME = '"$(TARGET_NAME)"'
    settings.SKIP_INSTALL = "YES"
    settings.SWIFT_EMIT_LOC_STRINGS = "YES"
    settings.SWIFT_VERSION = 5.0
    settings.TARGETED_DEVICE_FAMILY = 1
  }
}

// target에 build phase가 없으면 생성
function ensureTargetBuildPhase(project, targetUuid, sectionName, phaseName) {
  const target = project.hash.project.objects.PBXNativeTarget[targetUuid]
  const existing = target.buildPhases.find((item) => item.comment === phaseName)

  if (existing) {
    return existing.value
  }

  const uuid = project.generateUuid()
  project.hash.project.objects[sectionName] ??= {}
  project.hash.project.objects[sectionName][uuid] = {
    isa: sectionName,
    buildActionMask: 2147483647,
    files: [],
    runOnlyForDeploymentPostprocessing: 0,
  }
  project.hash.project.objects[sectionName][`${uuid}_comment`] = phaseName
  target.buildPhases.push({ value: uuid, comment: phaseName })

  return uuid
}

// 앱 target이 Widget extension target을 먼저 빌드하도록 의존성 보장
function ensureTargetDependency(project, targetUuid, dependencyTargetUuid) {
  const target = project.hash.project.objects.PBXNativeTarget[targetUuid]
  const existing = target.dependencies.some((dependency) => {
    const dependencyObject =
      project.hash.project.objects.PBXTargetDependency?.[dependency.value]

    return dependencyObject?.target === dependencyTargetUuid
  })

  if (existing) {
    return
  }

  project.hash.project.objects.PBXTargetDependency ??= {}
  project.hash.project.objects.PBXContainerItemProxy ??= {}
  project.addTargetDependency(targetUuid, [dependencyTargetUuid])
}

// app bundle에 extension을 code sign 포함해 embed
function normalizeEmbeddedLiveActivityProductBuildFile(project, targetUuid) {
  const target = project.hash.project.objects.PBXNativeTarget[targetUuid]
  const productReference = target.productReference
  const buildFiles = project.hash.project.objects.PBXBuildFile

  for (const [uuid, buildFile] of Object.entries(buildFiles)) {
    if (uuid.endsWith("_comment")) {
      continue
    }

    if (buildFile.fileRef === productReference) {
      buildFile.settings = {
        ATTRIBUTES: ["CodeSignOnCopy", "RemoveHeadersOnCopy"],
      }
    }
  }
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
module.exports = function withWorkoutSession(config) {
  config = withInfoPlist(config, (config) => {
    config.modResults.NSSupportsLiveActivities = true

    return config
  })

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
    const sourceRoot = path.join(
      config.modRequest.projectRoot,
      "plugins",
      "ios",
      "workout-session",
    )
    const liveActivitySourceRoot = path.join(
      config.modRequest.projectRoot,
      "plugins",
      "ios",
      "workout-live-activity",
    )
    const appRoot = path.join(iosRoot, projectName)
    const extensionRoot = path.join(iosRoot, LIVE_ACTIVITY_EXTENSION_TARGET)
    const appGroup = findAppGroup(project, projectName)
    const target = project.getFirstTarget().uuid
    const appBundleIdentifier =
      config.ios?.bundleIdentifier ?? "com.juhun.yepbuddy.app"
    const extensionBundleIdentifier = `${appBundleIdentifier}.${LIVE_ACTIVITY_EXTENSION_TARGET}`
    const appVersion = config.version ?? "1.0"
    const appBuildNumber = config.ios?.buildNumber ?? "1"
    const entitlementsPath = path.join(
      iosRoot,
      projectName,
      `${projectName}.entitlements`,
    )

    if (!appGroup) {
      throw new Error(`Unable to find iOS app group for ${projectName}`)
    }

    fs.mkdirSync(appRoot, { recursive: true })
    fs.mkdirSync(extensionRoot, { recursive: true })

    for (const fileName of MODULE_FILES) {
      // plugins/ios 원본 파일의 prebuild 산출물 복사
      const sourcePath = path.join(
        fileName.startsWith("WorkoutLiveActivity")
          ? liveActivitySourceRoot
          : sourceRoot,
        fileName,
      )
      const destinationPath = path.join(appRoot, fileName)
      const projectPath = `${projectName}/${fileName}`

      fs.copyFileSync(sourcePath, destinationPath)

      // 반복 prebuild 시 Xcode source file reference 중복 등록 방지
      if (!project.hasFile(projectPath)) {
        project.addSourceFile(projectPath, { target }, appGroup)
      }
    }

    const extensionGroup = ensureRootGroup(
      project,
      LIVE_ACTIVITY_EXTENSION_TARGET,
      LIVE_ACTIVITY_EXTENSION_TARGET,
    )

    let extensionTarget = findNativeTargetUuid(
      project,
      LIVE_ACTIVITY_EXTENSION_TARGET,
    )
    if (!extensionTarget) {
      extensionTarget = project.addTarget(
        LIVE_ACTIVITY_EXTENSION_TARGET,
        "app_extension",
        LIVE_ACTIVITY_EXTENSION_TARGET,
        extensionBundleIdentifier,
      ).uuid
    }
    ensureTargetBuildPhase(
      project,
      extensionTarget,
      "PBXSourcesBuildPhase",
      "Sources",
    )
    ensureTargetBuildPhase(
      project,
      extensionTarget,
      "PBXFrameworksBuildPhase",
      "Frameworks",
    )
    ensureTargetBuildPhase(
      project,
      extensionTarget,
      "PBXResourcesBuildPhase",
      "Resources",
    )
    ensureTargetDependency(project, target, extensionTarget)
    normalizeEmbeddedLiveActivityProductBuildFile(project, extensionTarget)

    for (const fileName of LIVE_ACTIVITY_EXTENSION_FILES) {
      const sourcePath = path.join(liveActivitySourceRoot, fileName)
      const destinationPath = path.join(extensionRoot, fileName)

      fs.copyFileSync(sourcePath, destinationPath)

      if (fileName.endsWith(".swift")) {
        if (!project.hasFile(fileName)) {
          project.addSourceFile(fileName, { target: extensionTarget }, extensionGroup)
        }
      } else if (!project.hasFile(fileName)) {
        project.addFile(fileName, extensionGroup)
      }
    }

    const targetAttributes =
      project.getFirstProject().firstProject.attributes.TargetAttributes
    targetAttributes[extensionTarget] = {
      ...(targetAttributes[extensionTarget] ?? {}),
      CreatedOnToolsVersion: 15.0,
    }
    normalizeLiveActivityExtensionBuildSettings(
      project,
      extensionTarget,
      extensionBundleIdentifier,
      appVersion,
      appBuildNumber,
    )

    // Xcode project mod 이후 실제 entitlements 파일 최종 정규화
    normalizeHealthKitEntitlementsFile(entitlementsPath)

    return config
  })
}
