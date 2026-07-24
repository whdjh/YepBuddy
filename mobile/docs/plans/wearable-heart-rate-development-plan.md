# 웨어러블 실시간 심박수 개발 설치 계획

> 작성일: 2026-07-20
> 상태: 구현 전 계획
> 대상: Apple Watch, Wear OS 기반 Galaxy Watch
> 배포 범위: App Store·Play Store 공개 배포 없음. 개발 서명/ADB 설치만 지원

## 1. 목표

YepBuddy 운동 중 화면에 Apple Watch 또는 Galaxy Watch의 광학 심박 센서 값을 실시간으로 표시한다.

공개 스토어 배포는 하지 않지만, 휴대폰 앱과 같은 저장소에 최소한의 워치 실행 모듈을 두고 실제 워치에는 개발 빌드로 설치한다. 휴대폰 코드만으로 워치 센서에 직접 접근하는 방식은 범위에서 제외한다.

## 2. 결정 요약

| 항목 | 결정 |
| --- | --- |
| Apple Watch 연결 | watchOS primary `HKWorkoutSession`을 시작하고 iPhone에 mirrored session과 metric payload를 전달한다. |
| Galaxy Watch 연결 | Wear OS `Health Services`로 심박수를 읽고 Wearable Data Layer로 Android 휴대폰에 전달한다. |
| 배포 | Apple은 Xcode 개발 서명, Galaxy는 Android Studio/ADB debug 설치만 사용한다. |
| UI | 기존 운동 중 `StatsSection`과 `WorkoutLiveStats` 계약을 재사용한다. 값이 들어오면 현재 규칙대로 지표 영역을 표시한다. |
| 센서 선택 | 기본값은 `auto`. Apple Watch 경로가 준비되면 우선 사용하고 실패하면 iPhone/AirPods 경로로 폴백한다. Android는 Wear OS 연결 실패 시 심박수를 비운 채 로컬 운동을 계속한다. |
| HealthKit 저장 | Apple Watch 경로에서는 Watch가 workout의 단일 원본이 된다. iPhone에서 동일 workout을 중복 저장하지 않는다. |
| 서버 전송 | 하지 않는다. 심박수는 운동 화면과 기기 Health 저장소 안에서만 사용한다. |

## 3. 현재 구현 기준

- iOS 26 이상에서는 iPhone `HKWorkoutSession`과 `HKLiveWorkoutBuilder`로 AirPods Pro 3 등 iPhone live metric을 수신한다.
- `WorkoutMetricProvider`와 `watchMirroredWorkoutProvider` 자리는 이미 있지만 Apple Watch provider는 항상 unavailable을 반환한다.
- `WorkoutMetricSource`에는 `iphoneLiveWorkout`, `watchMirroredWorkout`, `healthKitFallback`이 있다.
- Android에는 Wear OS module, Health Services 의존성, Data Layer listener가 없다.
- 운동 중 화면은 심박수 또는 칼로리 값이 하나라도 들어오면 기존 `StatsSection`을 표시한다.
- `docs/page/05_workout.md`의 Apple Watch·Galaxy Watch 미지원 문구는 현재 구현 설명이므로 이 계획 단계에서는 유지한다. 실제 구현을 시작하는 브랜치에서는 프로젝트 규칙에 따라 코드보다 먼저 목표 동작으로 갱신한다.

## 4. 범위

### 포함

- 같은 저장소 안의 최소 watchOS companion target
- 같은 저장소 안의 최소 Wear OS module
- 워치 심박수 권한 요청과 capability 확인
- 최초 권한 요청에 필요한 최소 워치 화면
- 운동 시작, 일시정지, 재개, 종료 상태 동기화
- 워치에서 휴대폰으로 최신 BPM과 상태 전달
- 기존 React Native 운동 상태로 metric 이벤트 연결
- 연결 끊김, 권한 거부, 센서 대기 상태의 안전한 폴백
- 에뮬레이터/모의 데이터 및 실제 기기 검증 절차

### 제외

- App Store, TestFlight, Play Store, 내부 테스트 트랙 배포
- 독립적인 워치 운동 기록 UI
- 워치에서 운동 부위, 세트 수, 메모 입력
- 삼성 Tizen 기반 구형 Galaxy Watch
- Samsung Health/Health Connect 동기화 데이터를 실시간 센서 대체재로 사용하는 방식
- Galaxy Watch의 모델별 비공식 BLE 운동기구 브로드캐스트 의존
- 서버 저장, 원격 분석, 의료 기능

## 5. 목표 구조

### 5.1 Apple Watch

```text
운동 시작(iPhone)
  -> HKHealthStore.startWatchApp
  -> watchOS companion이 primary HKWorkoutSession 시작
  -> Watch의 HKLiveWorkoutBuilder가 heartRate 수집
  -> workout session remote data로 BPM payload 전송
  -> iPhone mirrored session receiver
  -> React Native watchMirroredWorkoutProvider
  -> WorkoutLiveStats
  -> 운동 중 StatsSection
```

원칙:

- Watch가 심박수와 HealthKit workout 저장의 원본이다.
- iPhone은 화면 표시, 로컬 세션 상태, pause/resume/end 명령을 담당한다.
- Watch 시작 또는 mirroring이 제한 시간 안에 준비되지 않으면 기존 `iphoneLiveWorkoutProvider`로 전환한다.
- 연결이 일시적으로 끊기면 직전 심박수 유지 규칙을 사용하되, stale timeout 이후 상태를 `waitingSensor`로 바꾼다.

### 5.2 Galaxy Watch

```text
운동 시작(Android phone)
  -> Wear OS module에 start command
  -> Health Services capability/권한 확인
  -> ExerciseClient 기반 strength workout 시작
  -> HEART_RATE_BPM update
  -> Wearable Data Layer urgent message/data item
  -> Android phone listener service
  -> React Native native module/event emitter
  -> WorkoutLiveStats
  -> 운동 중 StatsSection
```

원칙:

- 운동 기록 중 지속 측정은 `MeasureClient`의 단기 측정보다 `ExerciseClient`를 우선한다.
- phone과 wear module은 개발 빌드에서 동일한 application ID와 signing key를 사용한다.
- `CapabilityClient`로 워치 앱 설치·도달 가능 여부를 확인한다.
- start/pause/resume/end/discard 명령은 `MessageClient`, 최신 metric은 `DataClient`로 분리한다.
- Wear OS 연결 실패가 로컬 운동 시작·종료를 막지 않는다.
- Wear OS가 없는 Android 기기에서는 현재와 동일하게 심박수 영역이 비어 있을 수 있다.

## 6. 공통 metric 계약

기존 `WorkoutLiveStats`를 유지하고 Galaxy source만 추가한다.

```ts
type WorkoutMetricSource =
  | "iphoneLiveWorkout"
  | "watchMirroredWorkout"
  | "wearOsHealthServices"
  | "healthKitFallback"
```

워치에서 전달하는 최소 payload:

| 필드 | 형식 | 규칙 |
| --- | --- | --- |
| `heartRate` | 정수 BPM 또는 `null` | 0 이하, NaN, 비정상 payload는 폐기 |
| `status` | `starting`, `waitingSensor`, `live`, `paused`, `ended`, `error` | 공통 상태 계약 사용 |
| `updatedAt` | ISO 8601 | stale 판단 기준 |
| `source` | provider source | 플랫폼별 고정 값 |
| `errorCode` | 문자열 또는 `null` | UI 문구가 아니라 진단·폴백 판단에 사용 |

칼로리는 1차 목표에서 기존 iPhone HealthKit 값만 유지한다. Watch/Wear OS 칼로리까지 연결하는 작업은 심박수 경로가 안정화된 뒤 별도 단계로 확장한다.

## 7. 구현 단계

### 단계 0. 개발 플래그와 계약 고정

작업:

- 구현 브랜치의 첫 변경으로 canonical `docs/page/05_workout.md`에 목표 동작, fallback, 현재 미검증 범위를 먼저 반영
- 개발 설치 전용 플래그 `YB_ENABLE_WEARABLE_HEART_RATE` 정의
- `WorkoutMetricSource`에 Wear OS source 추가
- provider 선택과 폴백 우선순위를 순수 함수로 분리
- stale timeout, 연결 제한 시간, error code 목록 정의
- mock provider로 BPM 변화 이벤트를 발생시키는 테스트 경로 마련

완료 기준:

- 플래그가 꺼진 기본 빌드의 동작이 현재와 동일하다.
- mock BPM이 기존 운동 중 화면에 표시되고 마지막 정상값 보존 규칙이 유지된다.

### 단계 1. Apple Watch 개발 target

작업:

- Expo config plugin의 iOS source of truth에 watchOS app target, product embed, target dependency, bundle identifier, `WKCompanionAppBundleIdentifier` 설정 추가
- watchOS target에 HealthKit capability와 심박수/workout 사용 설명 추가
- iPhone에서 `startWatchApp(with:)` 호출
- Watch에서 primary `HKWorkoutSession`과 `HKLiveWorkoutBuilder` 시작
- Watch의 최신 BPM을 Codable payload로 iPhone mirrored session에 전달
- iPhone native bridge에서 start/pause/resume/end/discard/read/subscribe와 가능한 범위의 session recovery 구현
- 기존 `watchMirroredWorkoutProvider` unavailable stub 교체
- Watch 경로 종료 시 Watch workout만 저장하고 iPhone 중복 `saveWorkout` 방지
- iOS 17/watchOS 10 이상의 mirroring API availability와 기존 iOS 26 이상 iPhone-only session 경로를 분리

완료 기준:

- Xcode에서 iPhone 앱과 watchOS target이 모두 build된다.
- 개발자 모드를 켠 paired iPhone/Watch에 Xcode로 설치된다.
- iPhone에서 운동을 시작하면 Watch 세션이 시작되고 BPM이 운동 중 화면에 갱신된다.
- pause/resume/end 상태가 양쪽에 동일하게 반영된다.
- 저장 없이 종료와 앱 재진입 복구가 provider 소유권을 잃지 않는다.
- Watch가 없거나 권한을 거부하면 제한 시간 뒤 iPhone/AirPods 경로로 폴백한다.
- 완료된 workout이 HealthKit에 하나만 저장된다.

### 단계 2. Wear OS 개발 module

작업:

- Android 프로젝트에 `:wear` application module 추가
- Wear OS 3 이상과 현재 권한 모델에 맞춰 심박수·운동 권한 선언
- `Health Services ExerciseClient` capability 확인, foreground health service, 운동 lifecycle 구현
- `CapabilityClient`로 phone/watch 준비 상태 확인
- `MessageClient`로 start/pause/resume/end/discard 명령 전달
- `HEART_RATE_BPM` 최신값을 `DataClient`로 phone에 전송
- phone app에 `WearableListenerService`와 React Native native event bridge 추가
- Android용 `wearOsHealthServicesProvider` 구현
- 연결, 권한 거부, 센서 미착용, 앱 종료에 대한 cleanup 구현
- Health Services Client와 Play Services Wearable 의존성 추가 전 사용자 승인

완료 기준:

- phone과 Wear OS debug APK가 각각 build된다.
- Wear OS emulator와 phone emulator를 pairing할 수 있다.
- synthetic walking/running 데이터가 YepBuddy 운동 중 화면에 표시된다.
- pause/resume/end 시 sensor callback과 foreground exercise가 정리된다.
- 저장 없이 종료와 연결 끊김 후 재연결 시에도 provider 상태가 일관된다.
- 실제 Galaxy Watch 개발 설치 절차가 문서화된다.

### 단계 3. 공통 orchestration 통합

작업:

- `startWorkoutSession`이 플랫폼과 개발 플래그에 따라 provider를 선택하도록 변경
- provider 선택 우선순위와 fallback을 한 곳에서 관리
- provider 이벤트를 기존 `healthKitWorkoutSync`와 reducer에 연결
- source-aware 종료 결과로 HealthKit 중복 저장 방지
- 앱 재진입 시 iPhone/Watch session 복구 범위를 구분
- Live Activity action이 `LiveWorkoutSessionController`를 직접 호출하지 않고 현재 활성 provider의 pause/resume/end router를 통하도록 변경

권장 우선순위:

```text
iOS: Apple Watch -> iPhone/AirPods -> HealthKit sample fallback
Android: Wear OS -> live metric 없음
```

완료 기준:

- 플랫폼별 provider 전환 테스트가 통과한다.
- 센서 실패가 로컬 운동 기록, 타이머, 세트 입력, 완료 저장을 방해하지 않는다.
- 이전보다 낮은 칼로리나 일시적인 `null` 심박수로 화면 값이 후퇴하지 않는다.

### 단계 4. 명세 최종 대조와 운영 문서 갱신

작업:

- 단계 0에서 먼저 바꾼 `docs/page/05_workout.md`를 실제 검증 결과와 최종 대조하고 미검증 표현을 정리
- `src/entities/README.md`에 provider와 native boundary 추가
- `src/features/README.md`에 provider orchestration과 fallback 추가
- 개발 설치, 권한 초기화, 로그 확인, 제거 절차 작성
- HTML 화면 기능서는 canonical md 반영 후 필요할 때만 재생성

완료 기준:

- 문서가 실제 검증된 동작만 설명한다.
- 공개 스토어 배포를 지원한다고 오해할 표현이 없다.

## 8. 예상 파일 영향 범위

| 영역 | 예상 변경 |
| --- | --- |
| 공통 entity | `src/entities/workout-session/api/*Provider.ts`, `healthKit.ts`, `workoutMetricsProvider.ts`, `model/types.ts`, `index.ts` |
| 운동 feature | `src/features/do-workout/lib/healthKitWorkoutSync.ts`, 필요 시 provider 선택 hook |
| iOS plugin source | `plugins/ios/workout-session/`, `plugins/with-workout-session.js` 또는 별도 wearable config plugin |
| 생성된 iOS project | watchOS target, entitlements, Info.plist, embed phase, native bridge |
| Android phone | native listener service, React Native bridge, manifest, Gradle dependency |
| Wear OS | 신규 `android/wear/` module과 Health Services/Data Layer 코드 |
| 테스트 | provider 선택, payload 정규화, stale/fallback, pause/resume/end, plugin idempotency |
| 문서 | 구현 완료 시 `docs/page/05_workout.md`, `src/entities/README.md`, `src/features/README.md` |

Expo prebuild에서 네이티브 변경이 사라지지 않도록 iOS target 구성과 반복 가능한 native 설정은 config plugin을 source of truth로 둔다. 생성된 `ios/`와 `android/` 파일만 직접 고쳐 끝내지 않는다.

## 9. 검증 계획

### 자동 검증

- TypeScript typecheck/lint
- provider 선택과 폴백 단위 테스트
- metric payload 정규화와 stale timeout 단위 테스트
- pause/resume/end lifecycle 테스트
- iOS config plugin을 두 번 실행해도 target/file이 중복되지 않는 idempotency 테스트
- Android phone/wear debug build

### 개발 장비 없이 가능한 검증

- mock provider로 운동 중 화면 심박수 렌더링
- Wear OS emulator synthetic heart-rate 데이터 수신
- phone emulator와 Wear OS emulator Data Layer 전달
- native bridge contract와 오류 payload 테스트

### 실제 기기가 필요한 검증

| 조합 | 필수 확인 |
| --- | --- |
| iPhone + Apple Watch | 실제 광학 심박수, mirroring, 백그라운드, 화면 잠금, pause/resume/end/discard/recovery, HealthKit 중복 저장 여부 |
| Android phone + Galaxy Watch | 실제 `HEART_RATE_BPM`, 권한, 손목 미착용, 거리 이탈/재연결, 배터리, pause/resume/end/discard |
| iPhone + AirPods Pro 3 | Apple Watch 기능 추가 후 기존 iPhone/AirPods 폴백 회귀 여부 |

Apple의 multidevice workout sample은 실제 기기 실행을 요구하므로 Apple Watch 센서 통합 완료 판정은 실물 검증 전까지 보류한다.

## 10. 주요 위험과 대응

| 위험 | 대응 |
| --- | --- |
| Apple Watch 실물 기기 부재 | 구현과 빌드까지만 진행하고 실제 센서 완료 조건은 보류한다. 최종적으로 기기 대여 또는 개발 테스터 1명이 필요하다. |
| Expo prebuild가 watch target을 제거 | config plugin으로 target 생성·복사를 자동화하고 idempotency 테스트를 둔다. |
| Watch/iPhone 양쪽에서 workout 중복 저장 | provider별 workout owner를 명시하고 source-aware end flow를 적용한다. |
| 워치 연결이 운동 시작을 지연 | 짧은 연결 제한 시간 후 기존 provider로 폴백하고 로컬 운동은 즉시 계속한다. |
| 폴백 직전에 Watch가 늦게 시작되어 workout이 중복됨 | 시작 token과 단일 owner 상태를 두고 timeout 이후 늦게 도착한 세션을 즉시 정리한다. |
| 오래된 BPM을 실시간으로 오인 | `updatedAt` 기반 stale timeout과 `waitingSensor` 상태를 사용한다. |
| Wear OS 버전별 권한 차이 | API 수준에 따라 legacy `BODY_SENSORS`와 최신 `READ_HEART_RATE` 권한을 분기한다. |
| 최초 워치 권한 요청은 완전 무화면으로 처리하기 어려움 | 권한 안내와 승인만 담당하는 최소 워치 화면을 허용한다. |
| Live Activity가 iPhone 세션만 조작 | 모든 외부 command가 활성 provider router를 통하도록 통합 테스트한다. |
| 디버그 설치 만료·제거 | 설치/재서명/삭제 절차를 문서화하고 공개 배포 보장은 하지 않는다. |
| 개인 건강정보 로그 노출 | BPM payload 원문을 상시 로그로 남기지 않고 개발 로그도 최소화한다. |

## 11. 종료 조건

다음을 모두 만족하면 계획의 구현이 완료된 것으로 본다.

1. App Store·Play Store 공개 없이 개발 빌드로 phone/watch 양쪽을 설치할 수 있다.
2. Apple Watch와 Galaxy Watch의 실제 BPM이 각각 YepBuddy 운동 중 화면에 표시된다.
3. pause/resume/end와 연결 실패가 로컬 운동 상태를 망가뜨리지 않는다.
4. Apple Watch 경로에서 HealthKit workout이 중복 저장되지 않는다.
5. 워치가 없을 때 기존 iPhone/AirPods 경로가 회귀하지 않는다.
6. 자동 테스트, native debug build, 실제 기기 검증 결과가 문서화된다.
7. 실제 동작에 맞춰 canonical 화면 기능서와 entity/feature 가이드가 갱신된다.

## 12. 공식 참고 자료

- Apple: [Building a multidevice workout app](https://developer.apple.com/documentation/HealthKit/building-a-multidevice-workout-app)
- Apple: [Run apps on simulated or physical devices](https://developer.apple.com/documentation/Xcode/running-your-app-on-simulated-or-physical-devices)
- Apple: [Enable Developer Mode](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device)
- Android: [Integrate a Wear OS module](https://developer.android.com/health-and-fitness/fitness/basic-app/integrate-wear-os)
- Android: [Run apps on a hardware device](https://developer.android.com/studio/run/device)
- Android: [Run apps on the Android Emulator](https://developer.android.com/studio/run/emulator)
