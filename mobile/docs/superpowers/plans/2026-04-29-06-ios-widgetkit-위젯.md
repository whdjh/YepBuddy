# iOS WidgetKit 월간 운동 캘린더 위젯 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** iOS WidgetKit 기반 잠금화면 / 홈화면 위젯에서 HealthKit 월별 운동 유무를 on/off 캘린더로 표시한다.

**Architecture:** 위젯은 React Native 바깥의 Swift/SwiftUI Widget Extension으로 구현한다. 데이터는 Widget Extension이 HealthKit을 직접 조회하고, 앱은 운동 종료 후 Expo native module을 통해 `WidgetCenter.reloadAllTimelines()`만 호출한다.

**Tech Stack:** Expo 55, @bacons/apple-targets, Swift, SwiftUI, WidgetKit, HealthKit, Expo Modules native module, Xcode 16+, bun

**Priority:** 6순위 / 가장 어려움 / 네이티브 타겟과 Xcode 검증 포함

**Original Phase:** 6

---

## 파일 맵

| 작업 | 경로 | Original Phase |
|------|------|----------------|
| Modify | `package.json` | 6 |
| Modify | `app.json` | 6 |
| Create | `targets/widget/expo-target.config.json` | 6 |
| Create | `targets/widget/Info.plist` | 6 |
| Create | `targets/widget/WidgetBundle.swift` | 6 |
| Create | `targets/widget/WorkoutCalendarWidget.swift` | 6 |
| Create | `targets/widget/WorkoutCalendarEntry.swift` | 6 |
| Create | `targets/widget/WorkoutCalendarProvider.swift` | 6 |
| Create | `targets/widget/WorkoutCalendarView.swift` | 6 |
| Create | `targets/widget/HealthKitReader.swift` | 6 |
| Create | `targets/widget/Assets.xcassets/Contents.json` | 6 |
| Create | `modules/widget-reloader/package.json` | 6 |
| Create | `modules/widget-reloader/expo-module.config.json` | 6 |
| Create | `modules/widget-reloader/ios/WidgetReloader.swift` | 6 |
| Create | `modules/widget-reloader/index.ts` | 6 |
| Modify | 운동 종료 플로우 (reloadAllWidgetTimelines 호출) | 6 |

---

## 구현 계획

> `@bacons/apple-targets`는 `app.json`에 플러그인을 1회 등록하고 `targets/*/expo-target.config.@(json|js)`를 스캔해 Xcode target을 구성한다. App Group은 메인 앱 entitlements와 widget target entitlements에 같은 값을 넣는다.

### Task 19: Apple target / App Group / HealthKit capability 셋업

**Files:**
- Modify: `package.json`
- Modify: `app.json`
- Create: `targets/widget/expo-target.config.json`
- Create: `targets/widget/Info.plist`
- Create: `targets/widget/Assets.xcassets/Contents.json`

- [ ] **Step 1: @bacons/apple-targets 설치**

```bash
cd mobile && bun add -d @bacons/apple-targets
```

Expected: `package.json`과 `bun.lock`에 `@bacons/apple-targets`가 추가된다.

- [ ] **Step 2: app.json에 메인 앱 entitlement / HealthKit 문구 / target plugin 추가**

`app.json`에서 `expo.ios`와 `expo.plugins`가 아래 값을 포함하도록 병합한다. Phase 5에서 추가한 사진 권한 문구가 이미 있으면 유지한다:

```json
{
  "expo": {
    "ios": {
      "icon": "./assets/expo.icon",
      "bundleIdentifier": "com.anonymous.yepbuddy",
      "infoPlist": {
        "NSHealthShareUsageDescription": "운동 기록을 읽고 위젯에 표시하기 위해 HealthKit 데이터에 접근합니다.",
        "NSHealthUpdateUsageDescription": "운동 기록을 HealthKit에 저장하기 위해 HealthKit 데이터에 접근합니다.",
        "NSPhotoLibraryUsageDescription": "운동 사진을 선택하기 위해 사진 라이브러리에 접근합니다.",
        "NSPhotoLibraryAddUsageDescription": "오운완 이미지를 사진 앱에 저장합니다.",
        "NSCameraUsageDescription": "운동 사진을 찍기 위해 카메라에 접근합니다."
      },
      "entitlements": {
        "com.apple.security.application-groups": [
          "group.com.anonymous.yepbuddy.shared"
        ],
        "com.apple.developer.healthkit": true
      }
    },
    "plugins": [
      "expo-router",
      "@bacons/apple-targets",
      [
        "expo-splash-screen",
        {
          "backgroundColor": "#208AEF",
          "android": {
            "image": "./assets/images/splash-icon.png",
            "imageWidth": 76
          }
        }
      ],
      ["expo-audio", { "enableBackgroundPlayback": true }]
    ]
  }
}
```

- [ ] **Step 3: widget target config 생성**

`targets/widget/expo-target.config.json` 생성:

```json
{
  "type": "widget",
  "name": "WorkoutCalendarWidget",
  "displayName": "YepBuddy",
  "bundleIdentifier": ".widget",
  "deploymentTarget": "17.0",
  "exportJs": false,
  "frameworks": ["WidgetKit", "SwiftUI", "HealthKit"],
  "entitlements": {
    "com.apple.security.application-groups": [
      "group.com.anonymous.yepbuddy.shared"
    ],
    "com.apple.developer.healthkit": true
  },
  "colors": {
    "$accent": "#9B7E56",
    "$widgetBackground": "#111111"
  }
}
```

- [ ] **Step 4: widget Info.plist 생성**

`targets/widget/Info.plist` 생성:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>YepBuddy</string>
  <key>NSHealthShareUsageDescription</key>
  <string>위젯에서 월별 운동 기록을 표시하기 위해 HealthKit 운동 데이터를 읽습니다.</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>
```

- [ ] **Step 5: asset catalog 루트 생성**

`targets/widget/Assets.xcassets/Contents.json` 생성:

```json
{
  "info": {
    "author": "xcode",
    "version": 1
  }
}
```

- [ ] **Step 6: 커밋**

```bash
cd mobile
git add package.json bun.lock app.json targets/widget/expo-target.config.json targets/widget/Info.plist targets/widget/Assets.xcassets/Contents.json
git commit -m "feat(widget): configure iOS widget target capabilities"
```

---

### Task 20: HealthKit 월별 운동 여부 조회 + TimelineProvider

**Files:**
- Create: `targets/widget/WorkoutCalendarEntry.swift`
- Create: `targets/widget/HealthKitReader.swift`
- Create: `targets/widget/WorkoutCalendarProvider.swift`

- [ ] **Step 1: Widget entry 타입 생성**

`targets/widget/WorkoutCalendarEntry.swift` 생성:

```swift
import Foundation
import WidgetKit

enum WorkoutCalendarEntryState {
  case ready
  case empty
  case permissionDenied
  case unavailable
}

struct WorkoutCalendarEntry: TimelineEntry {
  let date: Date
  let monthStart: Date
  let workoutDateKeys: Set<String>
  let state: WorkoutCalendarEntryState
}

extension WorkoutCalendarEntry {
  static func placeholder() -> WorkoutCalendarEntry {
    let now = Date()
    let monthStart = Calendar.current.dateInterval(of: .month, for: now)?.start ?? now

    return WorkoutCalendarEntry(
      date: now,
      monthStart: monthStart,
      workoutDateKeys: [],
      state: .empty
    )
  }
}
```

- [ ] **Step 2: HealthKitReader 구현**

`targets/widget/HealthKitReader.swift` 생성:

```swift
import Foundation
import HealthKit

enum DateKey {
  static func format(_ date: Date) -> String {
    let formatter = DateFormatter()
    formatter.calendar = Calendar(identifier: .gregorian)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    formatter.timeZone = TimeZone.current
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
  }
}

final class HealthKitReader {
  private let healthStore = HKHealthStore()

  func fetchWorkoutDateKeysForMonth(
    containing date: Date,
    completion: @escaping (WorkoutCalendarEntryState, Set<String>) -> Void
  ) {
    guard HKHealthStore.isHealthDataAvailable() else {
      DispatchQueue.main.async { completion(.unavailable, []) }
      return
    }

    let workoutType = HKObjectType.workoutType()
    let status = healthStore.authorizationStatus(for: workoutType)

    if status == .sharingDenied || status == .notDetermined {
      DispatchQueue.main.async { completion(.permissionDenied, []) }
      return
    }

    let calendar = Calendar.current

    guard let month = calendar.dateInterval(of: .month, for: date) else {
      DispatchQueue.main.async { completion(.unavailable, []) }
      return
    }

    let predicate = HKQuery.predicateForSamples(
      withStart: month.start,
      end: month.end,
      options: [.strictStartDate]
    )

    let query = HKSampleQuery(
      sampleType: workoutType,
      predicate: predicate,
      limit: HKObjectQueryNoLimit,
      sortDescriptors: nil
    ) { _, samples, error in
      if error != nil {
        DispatchQueue.main.async { completion(.unavailable, []) }
        return
      }

      let workouts = samples as? [HKWorkout] ?? []
      let keys = Set(workouts.map { DateKey.format($0.startDate) })
      let state: WorkoutCalendarEntryState = keys.isEmpty ? .empty : .ready

      DispatchQueue.main.async {
        completion(state, keys)
      }
    }

    healthStore.execute(query)
  }
}
```

- [ ] **Step 3: TimelineProvider 구현**

`targets/widget/WorkoutCalendarProvider.swift` 생성:

```swift
import Foundation
import WidgetKit

struct WorkoutCalendarProvider: TimelineProvider {
  private let reader = HealthKitReader()

  func placeholder(in context: Context) -> WorkoutCalendarEntry {
    WorkoutCalendarEntry.placeholder()
  }

  func getSnapshot(
    in context: Context,
    completion: @escaping (WorkoutCalendarEntry) -> Void
  ) {
    loadEntry(for: Date(), completion: completion)
  }

  func getTimeline(
    in context: Context,
    completion: @escaping (Timeline<WorkoutCalendarEntry>) -> Void
  ) {
    loadEntry(for: Date()) { entry in
      let nextRefresh = Calendar.current.date(byAdding: .hour, value: 6, to: Date()) ?? Date()
      completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
  }

  private func loadEntry(
    for date: Date,
    completion: @escaping (WorkoutCalendarEntry) -> Void
  ) {
    let monthStart = Calendar.current.dateInterval(of: .month, for: date)?.start ?? date

    reader.fetchWorkoutDateKeysForMonth(containing: date) { state, keys in
      completion(
        WorkoutCalendarEntry(
          date: date,
          monthStart: monthStart,
          workoutDateKeys: keys,
          state: state
        )
      )
    }
  }
}
```

- [ ] **Step 4: 커밋**

```bash
cd mobile
git add targets/widget/WorkoutCalendarEntry.swift targets/widget/HealthKitReader.swift targets/widget/WorkoutCalendarProvider.swift
git commit -m "feat(widget): add HealthKit timeline provider"
```

---

### Task 21: SwiftUI 월간 캘린더 위젯 UI

**Files:**
- Create: `targets/widget/WidgetBundle.swift`
- Create: `targets/widget/WorkoutCalendarWidget.swift`
- Create: `targets/widget/WorkoutCalendarView.swift`

- [ ] **Step 1: WorkoutCalendarView 구현**

`targets/widget/WorkoutCalendarView.swift` 생성:

```swift
import SwiftUI
import WidgetKit

struct WorkoutCalendarView: View {
  let entry: WorkoutCalendarEntry

  private let calendar = Calendar.current
  private let columns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 7)
  private let weekdaySymbols = ["일", "월", "화", "수", "목", "금", "토"]

  var body: some View {
    VStack(alignment: .leading, spacing: 8) {
      Text(monthTitle)
        .font(.caption)
        .fontWeight(.semibold)
        .foregroundStyle(.primary)

      switch entry.state {
      case .permissionDenied:
        statusView("HealthKit 권한 필요")
      case .unavailable:
        statusView("운동 기록을 읽을 수 없어요")
      case .empty, .ready:
        calendarGrid
      }
    }
    .padding(12)
    .containerBackground(Color(red: 0.07, green: 0.07, blue: 0.07), for: .widget)
  }

  private var monthTitle: String {
    let formatter = DateFormatter()
    formatter.locale = Locale(identifier: "ko_KR")
    formatter.dateFormat = "M월 운동"
    return formatter.string(from: entry.monthStart)
  }

  private var calendarGrid: some View {
    VStack(alignment: .leading, spacing: 5) {
      LazyVGrid(columns: columns, spacing: 4) {
        ForEach(weekdaySymbols, id: \.self) { symbol in
          Text(symbol)
            .font(.system(size: 8, weight: .medium))
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity)
        }

        ForEach(0..<leadingBlankCount, id: \.self) { _ in
          Color.clear
            .frame(height: 12)
        }

        ForEach(daysInMonth, id: \.self) { day in
          dayCell(day)
        }
      }

      if entry.state == .empty {
        Text("이번 달 운동 기록 없음")
          .font(.system(size: 9))
          .foregroundStyle(.secondary)
          .lineLimit(1)
      }
    }
  }

  private func statusView(_ text: String) -> some View {
    Text(text)
      .font(.system(size: 11, weight: .medium))
      .foregroundStyle(.secondary)
      .lineLimit(2)
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
  }

  private func dayCell(_ day: Date) -> some View {
    let workedOut = entry.workoutDateKeys.contains(DateKey.format(day))

    return ZStack {
      Circle()
        .fill(workedOut ? Color(red: 0.61, green: 0.49, blue: 0.34) : Color.clear)
        .overlay(
          Circle()
            .stroke(Color.secondary.opacity(workedOut ? 0 : 0.25), lineWidth: 1)
        )

      Text("\(calendar.component(.day, from: day))")
        .font(.system(size: 8, weight: workedOut ? .bold : .regular))
        .foregroundStyle(workedOut ? Color.white : Color.secondary)
    }
    .frame(height: 12)
  }

  private var daysInMonth: [Date] {
    guard let range = calendar.range(of: .day, in: .month, for: entry.monthStart) else {
      return []
    }

    return range.compactMap { day in
      calendar.date(byAdding: .day, value: day - 1, to: entry.monthStart)
    }
  }

  private var leadingBlankCount: Int {
    calendar.component(.weekday, from: entry.monthStart) - 1
  }
}
```

- [ ] **Step 2: Widget 정의**

`targets/widget/WorkoutCalendarWidget.swift` 생성:

```swift
import SwiftUI
import WidgetKit

struct WorkoutCalendarWidget: Widget {
  private let kind = "WorkoutCalendarWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: WorkoutCalendarProvider()) { entry in
      WorkoutCalendarView(entry: entry)
        .widgetURL(URL(string: "yepbuddy://")!)
    }
    .configurationDisplayName("YepBuddy")
    .description("이번 달 운동한 날을 표시합니다.")
    .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular])
  }
}
```

- [ ] **Step 3: WidgetBundle 생성**

`targets/widget/WidgetBundle.swift` 생성:

```swift
import WidgetKit
import SwiftUI

@main
struct YepBuddyWidgetBundle: WidgetBundle {
  var body: some Widget {
    WorkoutCalendarWidget()
  }
}
```

- [ ] **Step 4: 커밋**

```bash
cd mobile
git add targets/widget/WidgetBundle.swift targets/widget/WorkoutCalendarWidget.swift targets/widget/WorkoutCalendarView.swift
git commit -m "feat(widget): add monthly workout calendar view"
```

---

### Task 22: WidgetCenter reloadAllTimelines 네이티브 브리지

**Files:**
- Modify: `package.json`
- Create: `modules/widget-reloader/package.json`
- Create: `modules/widget-reloader/expo-module.config.json`
- Create: `modules/widget-reloader/ios/WidgetReloader.swift`
- Create: `modules/widget-reloader/index.ts`

- [ ] **Step 1: local module package 생성**

`modules/widget-reloader/package.json` 생성:

```json
{
  "name": "widget-reloader",
  "version": "1.0.0",
  "main": "index.ts",
  "private": true
}
```

- [ ] **Step 2: Expo module config 생성**

`modules/widget-reloader/expo-module.config.json` 생성:

```json
{
  "platforms": ["ios"],
  "ios": {
    "modules": ["WidgetReloaderModule"]
  }
}
```

- [ ] **Step 3: Swift native module 구현**

`modules/widget-reloader/ios/WidgetReloader.swift` 생성:

```swift
import ExpoModulesCore
import WidgetKit

public class WidgetReloaderModule: Module {
  public func definition() -> ModuleDefinition {
    Name("WidgetReloader")

    AsyncFunction("reloadAllTimelines") {
      if #available(iOS 14.0, *) {
        WidgetCenter.shared.reloadAllTimelines()
      }
    }
  }
}
```

- [ ] **Step 4: TypeScript wrapper 구현**

`modules/widget-reloader/index.ts` 생성:

```typescript
import { requireNativeModule } from "expo-modules-core"
import { Platform } from "react-native"

interface WidgetReloaderNativeModule {
  reloadAllTimelines: () => Promise<void>
}

const WidgetReloader =
  Platform.OS === "ios"
    ? requireNativeModule<WidgetReloaderNativeModule>("WidgetReloader")
    : null

export async function reloadAllWidgetTimelines(): Promise<void> {
  if (Platform.OS !== "ios" || !WidgetReloader) return
  await WidgetReloader.reloadAllTimelines()
}
```

- [ ] **Step 5: app package.json에 local dependency 추가**

`package.json`의 `dependencies`에 추가:

```json
"widget-reloader": "file:./modules/widget-reloader"
```

그 다음 설치 메타데이터를 갱신한다:

```bash
cd mobile && bun install
```

- [ ] **Step 6: TypeScript 확인**

```bash
cd mobile && bunx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 7: 커밋**

```bash
cd mobile
git add package.json bun.lock modules/widget-reloader/package.json modules/widget-reloader/expo-module.config.json modules/widget-reloader/ios/WidgetReloader.swift modules/widget-reloader/index.ts
git commit -m "feat(widget): add widget timeline reload bridge"
```

---

### Task 23: 운동 종료 플로우에 위젯 갱신 연결

**Files:**
- Modify: `src/features/do-workout/ui/ActiveWorkoutScreen.tsx`

- [ ] **Step 1: 현재 운동 종료 플로우 확인**

```bash
cd mobile && grep -n "handleComplete\\|scheduleWorkoutReminder22h\\|scheduleReminder22h" src/features/do-workout/ui/ActiveWorkoutScreen.tsx
```

- [ ] **Step 2: reloadAllWidgetTimelines import 추가**

`src/features/do-workout/ui/ActiveWorkoutScreen.tsx`에 추가:

```typescript
import { reloadAllWidgetTimelines } from "widget-reloader"
```

- [ ] **Step 3: 운동 저장 성공 후 위젯 갱신 호출**

`session.completedAt`이 확정되고 로컬 저장 / HealthKit 저장 시도가 끝난 뒤에 추가한다. 위젯 갱신 실패가 운동 종료 플로우를 막지 않도록 삼킨다:

```typescript
await reloadAllWidgetTimelines().catch(() => {})
```

Phase 4의 알림 예약과 같은 위치에 있다면 아래 순서로 둔다:

```typescript
await scheduleReminder22h(session.completedAt)
await reloadAllWidgetTimelines().catch(() => {})
```

- [ ] **Step 4: TypeScript 확인**

```bash
cd mobile && bunx tsc --noEmit
```

Expected: 에러 없음

- [ ] **Step 5: 커밋**

```bash
cd mobile
git add src/features/do-workout/ui/ActiveWorkoutScreen.tsx
git commit -m "feat(workout): refresh widgets after workout completion"
```

---

### Task 24: iOS prebuild / native target 검증

**Files:**
- Generated: `ios/`

- [ ] **Step 1: Expo prebuild 실행**

```bash
cd mobile && npx expo prebuild -p ios
```

Expected: `ios/`가 생성되고 Xcode project에 `WorkoutCalendarWidget` target이 포함된다.

- [ ] **Step 2: Xcode target 목록 확인**

```bash
cd mobile && xcodebuild -list -workspace ios/yepbuddy.xcworkspace
```

Expected: 출력의 `Targets` 섹션에 `yepbuddy`와 `WorkoutCalendarWidget`이 모두 표시된다.

- [ ] **Step 3: iOS Debug build 확인**

```bash
cd mobile && xcodebuild -workspace ios/yepbuddy.xcworkspace -scheme yepbuddy -configuration Debug -sdk iphonesimulator build
```

Expected: `** BUILD SUCCEEDED **`

- [ ] **Step 4: 위젯 수동 QA**

iOS Simulator 또는 실기기에서 확인한다:

```text
1. 앱에서 HealthKit 권한을 허용한다.
2. 운동을 1회 완료한다.
3. 홈 화면 위젯 또는 잠금화면 위젯에 YepBuddy를 추가한다.
4. 이번 달 캘린더에서 운동한 날짜만 on 상태로 표시되는지 확인한다.
5. 위젯을 탭했을 때 yepbuddy:// deep link로 앱 메인화면이 열리는지 확인한다.
6. HealthKit 권한을 거부한 상태에서 위젯이 권한 필요 상태를 표시하는지 확인한다.
```

- [ ] **Step 5: 커밋**

```bash
cd mobile
git add ios
git commit -m "chore(ios): generate widget extension target"
```

---

## 검증 체크리스트

- [ ] 앱과 위젯 target이 동일 App Group(`group.com.anonymous.yepbuddy.shared`)을 사용한다
- [ ] 위젯은 HealthKit에서 월별 workout 날짜만 직접 조회하고 앱 저장소를 읽지 않는다
- [ ] 위젯은 운동량 강도 차등 없이 운동한 날짜 on/off만 표시한다
- [ ] HealthKit 권한 거부 / 미결정 상태에서 위젯이 crash 없이 권한 필요 상태를 표시한다
- [ ] 운동 종료 후 `reloadAllWidgetTimelines()`가 호출되어 위젯 타임라인이 갱신된다
- [ ] 위젯 탭 시 `yepbuddy://`로 앱 메인화면이 열린다
