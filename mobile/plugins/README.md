# Mobile Plugins

Expo config plugin과 iOS 네이티브 브리지 원본을 두는 영역이다. 현재는 iPhone 실시간 운동 세션용 `WorkoutSession` 모듈만 포함한다.

이 문서는 향후 알림, Live Activities, Dynamic Island 작업을 추가할 때 기존 HealthKit session controller에 책임을 섞지 않기 위한 기록이다. 기준 설계는 `mobile/docs/superpowers/specs/2026-05-14-workout-session-plugin-refactor-design.md`에 있다.

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
```

`with-workout-session.js`는 Expo prebuild 때 `plugins/ios/workout-session`의 Swift 및 Objective-C 파일을 iOS app target으로 복사하고 Xcode source file reference를 등록한다. 또한 HealthKit entitlement를 정규화한다.

React Native 네이티브 모듈명은 `WorkoutSession`이다. JavaScript entity API 이름은 그대로 유지한다.

```text
NativeModules.WorkoutSession

startWorkoutSession
pauseWorkoutSession
resumeWorkoutSession
endWorkoutSession
discardWorkoutSession
readLiveWorkoutStats
```

## 책임 경계

| 파일 | 책임 |
| --- | --- |
| `with-workout-session.js` | Expo config plugin, 네이티브 파일 복사, Xcode app target 등록, HealthKit entitlement 정규화 |
| `ios/workout-session/WorkoutSessionModule.swift` | React Native 경계, promise 연결, 이벤트 발행, 앱 종료 정리 전달 |
| `ios/workout-session/WorkoutSessionBridge.m` | Objective-C `RCT_EXTERN_MODULE(WorkoutSession, RCTEventEmitter)` 선언과 method export |
| `ios/workout-session/LiveWorkoutSessionController.swift` | `HKWorkoutSession`, `HKLiveWorkoutBuilder`, lifecycle, delegate, 저장/폐기 처리 |
| `ios/workout-session/WorkoutSessionPayload.swift` | JS로 넘기는 stats, session state, start/end result payload 생성 |
| `ios/workout-session/HealthKitWorkoutAuthorization.swift` | HealthKit read/share type 정의와 권한 요청 |

`WorkoutSessionModule.swift`만 React Native를 알아야 한다. `LiveWorkoutSessionController.swift`는 React를 import하거나 `sendEvent`를 직접 호출하지 않는다. JS payload 필드와 event name은 `WorkoutSessionPayload.swift`에서 확인할 수 있게 유지한다.

## 향후 구조

새 네이티브 기능은 `workout-session` 폴더에 계속 붙이지 않고 형제 폴더로 분리한다.

```text
mobile/plugins/
  ios/
    live-activity/
      WorkoutLiveActivityAttributes.swift
      WorkoutLiveActivityController.swift
      WorkoutLiveActivityPayload.swift

    live-activity-widget/
      WorkoutLiveActivityWidget.swift
      WorkoutLiveActivityView.swift
      WorkoutDynamicIslandView.swift

    notifications/
      WorkoutNotificationController.swift
      WorkoutNotificationPayload.swift
```

`live-activity`는 app target에서 ActivityKit activity를 시작, 갱신, 종료하는 책임을 가진다. `live-activity-widget`은 Lock Screen, Live Activity, Dynamic Island UI를 담당하는 Widget Extension target으로 발전할 가능성이 높다. Dynamic Island UI 파일을 React Native bridge module이나 HealthKit session controller 안에 넣지 않는다.

`notifications`는 알림 예약, 알림 응답 처리, 알림 payload 생성을 담당한다. 커스텀 알림 UI가 필요하면 HealthKit session controller가 아니라 별도 notification extension 영역으로 분리한다.

## 추가 작업 규칙

- `yb:workout:*` 저장소 키와 `yb-*` design token prefix는 이 플러그인 명명 정리와 별개로 유지한다.
- Swift 함수 주석은 `/// 라이브 운동 시작`처럼 명사형 문구를 사용한다.
- `WorkoutSession`의 이벤트명, payload 필드, JS entity API는 명시적인 마이그레이션 요구가 있을 때만 변경한다.
- ActivityKit, WidgetKit, notification extension 코드는 HealthKit workout lifecycle 코드와 파일을 공유하지 않는다.
- Expo config plugin에 새 네이티브 파일을 추가할 때는 반복 prebuild에서 Xcode source file reference가 중복 등록되지 않는지 확인한다.

## 검증 메모

Workout session 플러그인을 수정한 뒤에는 가능한 범위에서 TypeScript, lint, prebuild 또는 config plugin 검증을 실행한다. 이전 `YB` 모듈명 참조가 남아 있으면 안 된다.

```bash
rg -n "YBWorkoutSession|with-yb-workout-session|NativeModules\\.YBWorkoutSession" mobile
```

의도적으로 유지하는 저장소 키와 design token prefix는 별도 범위다.

```bash
rg -n "yb:workout|yb-" mobile/src mobile/docs
```
