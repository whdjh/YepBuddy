# Mobile Plugins

Expo config plugin과 iOS 네이티브 원본을 두는 영역이다. 현재는 iPhone 실시간 운동 세션용 `WorkoutSession` React Native 모듈과 운동 Live Activity / Dynamic Island Widget Extension 원본을 포함한다.

이 문서는 알림, Live Activities, Dynamic Island 작업을 추가할 때 HealthKit session controller에 책임을 섞지 않기 위한 기록이다. 현재 파일 경계가 최신 책임 경계다.

## 현재 구조

```text
mobile/plugins/
  with-workout-session.js

  ios/
    workout-session/
      WorkoutSessionModule.swift
      WorkoutSessionBridge.m
      LiveWorkoutSessionController.swift
      WorkoutSessionPayload.swift
      HealthKitWorkoutAuthorization.swift

    workout-live-activity/
      WorkoutLiveActivityAttributes.swift
      WorkoutLiveActivityController.swift
      WorkoutLiveActivityWidget.swift
      Info.plist
```

`with-workout-session.js`는 Expo prebuild 때 `plugins/ios/workout-session`과 `plugins/ios/workout-live-activity`의 Swift 및 Objective-C 파일을 iOS app target 또는 Widget Extension target으로 복사하고 Xcode source file reference를 등록한다. 또한 HealthKit entitlement, `NSSupportsLiveActivities`, `WorkoutLiveActivityExtension` target, target dependency, extension embed 설정, extension build settings를 정규화한다.

React Native 네이티브 모듈명은 `WorkoutSession`이다. Objective-C bridge method는 짧은 native selector를 쓰고, JavaScript entity API는 앱 도메인 이름을 유지한다.

```text
NativeModules.WorkoutSession

start
recover
pause
resume
end
discard
readLiveStats
readWorkoutDetail
startLiveActivity
endLiveActivity
consumeLiveActivityCommands
```

`readWorkoutDetail(workoutUUID)`는 저장된 HealthKit UUID를 받는다. JS에서 저장 UUID가 없는 기록은 HealthKit 초기화·조회 없이 상세를 비운다. 네이티브는 `HKQuery.predicateForObject(with:)`로 그 workout만 조회하고 `predicateForObjects(from: workout)`와 strict 시작·종료 predicate를 AND로 묶어 연관 심박 샘플을 조회한다.

상세 payload에는 `workoutUUID`, `startDate`, `endDate`, `heartRateSamples`와 기존 요약 metric이 포함된다. 네이티브가 시작 시각순으로 정렬한 샘플은 `uuid`, `bpm`, `startDate`, `endDate`를 가지며 시각은 밀리초를 보존하는 ISO 문자열이다. JS는 양수 유한 BPM인 샘플만 남기고 그 목록의 평균을 계산한다. 심박 쿼리 실패는 빈 샘플 목록으로 처리해 선택된 workout 요약을 유지한다.

```text
entities/workout-session JavaScript API

startWorkoutSession
pauseWorkoutSession
resumeWorkoutSession
endWorkoutSession
discardWorkoutSession
readLiveWorkoutStats
subscribeLiveWorkoutStats
getWorkoutSessionDetailData
startWorkoutLiveActivity
endWorkoutLiveActivity
consumeWorkoutLiveActivityCommands
```

## 책임 경계

| 파일 | 책임 |
| --- | --- |
| `with-workout-session.js` | Expo config plugin, 네이티브 파일 복사, Xcode app target 등록, `WorkoutLiveActivityExtension` target 생성/정규화, extension embed, HealthKit entitlement 및 Live Activity Info.plist 정규화 |
| `ios/workout-session/WorkoutSessionModule.swift` | React Native 경계, promise 연결, 이벤트 발행, 앱 종료 정리 전달 |
| `ios/workout-session/WorkoutSessionBridge.m` | Objective-C `RCT_EXTERN_MODULE(WorkoutSession, RCTEventEmitter)` 선언과 method export |
| `ios/workout-session/LiveWorkoutSessionController.swift` | `HKWorkoutSession`, `HKLiveWorkoutBuilder`, lifecycle, delegate, 저장/폐기 처리 |
| `ios/workout-session/WorkoutSessionPayload.swift` | JS로 넘기는 stats, session state, start/end result payload 생성 |
| `ios/workout-session/HealthKitWorkoutAuthorization.swift` | HealthKit read/share type 정의와 권한 요청 |
| `ios/workout-live-activity/WorkoutLiveActivityAttributes.swift` | ActivityKit attributes, content state, Live Activity command queue, AppIntents command 실행 |
| `ios/workout-live-activity/WorkoutLiveActivityController.swift` | app target에서 ActivityKit activity 시작, 갱신, 종료 |
| `ios/workout-live-activity/WorkoutLiveActivityWidget.swift` | Lock Screen Live Activity, Dynamic Island, interactive command button UI |
| `ios/workout-live-activity/Info.plist` | `WorkoutLiveActivityExtension` WidgetKit extension Info.plist |

`WorkoutSessionModule.swift`만 React Native를 알아야 한다. `LiveWorkoutSessionController.swift`는 React를 import하거나 `sendEvent`를 직접 호출하지 않는다. JS payload 필드와 event name은 `WorkoutSessionPayload.swift`에서 확인할 수 있게 유지한다.

`WorkoutLiveActivityAttributes.swift`는 app target과 extension target이 함께 쓰는 파일이다. extension build에서는 `WORKOUT_LIVE_ACTIVITY_EXTENSION` Swift flag로 HealthKit session controller 직접 호출을 제외한다. Widget UI와 Dynamic Island UI는 `workout-session` 폴더에 두지 않는다.

현재 native event name은 다음과 같다.

```text
workoutStatsChanged
workoutSessionStateChanged
```

현재 Live Activity command 값은 다음과 같다.

```text
pause
resume
startCardio
finish
```

## 향후 확장 구조

새 네이티브 기능은 `workout-session` 폴더에 계속 붙이지 않고 형제 폴더로 분리한다.

```text
mobile/plugins/
  ios/
    workout-live-activity/
      WorkoutLiveActivityAttributes.swift
      WorkoutLiveActivityController.swift
      WorkoutLiveActivityWidget.swift
      Info.plist

    notifications/
      WorkoutNotificationController.swift
      WorkoutNotificationPayload.swift
```

`workout-live-activity`는 ActivityKit activity 제어와 Widget Extension UI 원본을 함께 보관한다. app target에 들어가는 파일과 extension target에 들어가는 파일은 `with-workout-session.js`의 `MODULE_FILES`, `LIVE_ACTIVITY_EXTENSION_FILES` 목록으로 구분한다. Dynamic Island UI 파일을 React Native bridge module이나 HealthKit session controller 안에 넣지 않는다.

`notifications`는 향후 네이티브 알림 예약, 알림 응답 처리, 알림 payload 생성을 담당한다. 커스텀 알림 UI가 필요하면 HealthKit session controller가 아니라 별도 notification extension 영역으로 분리한다.

## 추가 작업 규칙

- `yb:workout:*` 저장소 키와 `yb-*` design token prefix는 이 플러그인 명명 정리와 별개로 유지한다.
- `yb:workout-live-activity:commands`는 Live Activity command queue 저장소 키로 유지한다.
- Swift 함수 주석은 `/// 라이브 운동 시작`처럼 명사형 문구를 사용한다.
- `WorkoutSession`의 이벤트명, payload 필드, JS entity API는 명시적인 마이그레이션 요구가 있을 때만 변경한다.
- ActivityKit, WidgetKit, notification extension 코드는 HealthKit workout lifecycle 코드와 파일을 공유하지 않는다. app target과 extension target이 공유해야 하는 값은 attributes/content state처럼 target 경계에 맞는 작은 타입으로 제한한다.
- Expo config plugin에 새 네이티브 파일을 추가할 때는 반복 prebuild에서 Xcode source file reference가 중복 등록되지 않는지 확인한다.
- Widget Extension 파일을 추가할 때는 app target용 파일인지 extension target용 파일인지 먼저 정하고 `MODULE_FILES` 또는 `LIVE_ACTIVITY_EXTENSION_FILES`에만 추가한다.
- `WorkoutLiveActivityExtension` build setting은 iOS 16.2 이상, `SWIFT_VERSION = 5.0`, `OTHER_SWIFT_FLAGS = "$(inherited) -D WORKOUT_LIVE_ACTIVITY_EXTENSION"` 계약을 유지한다.

## 검증 메모

Workout session 플러그인을 수정한 뒤에는 가능한 범위에서 TypeScript, lint, prebuild 또는 config plugin 검증을 실행한다.

현재 저장소에 있는 plugin/widget 계약 검증은 다음 명령이다.

```bash
cd mobile
node scripts/check_workout_session_plugin.cjs
node scripts/check_dynamic_island_widget.js
```

이전 `YB` 모듈명 참조가 남아 있으면 안 된다.

```bash
rg -n "YBWorkoutSession|with-yb-workout-session|NativeModules\\.YBWorkoutSession" mobile/src mobile/plugins/ios mobile/plugins/with-workout-session.js mobile/app.json mobile/scripts
```

의도적으로 유지하는 저장소 키와 design token prefix는 별도 범위다.

```bash
rg -n "yb:workout|yb-" mobile/src mobile/docs
```
