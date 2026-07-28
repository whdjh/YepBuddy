# Android 운동 중 알림 제어 구현 계획

> 상태: 계획 확정, 미구현  
> 작성일: 2026-07-27  
> 관련 현재 기능서: [`docs/page/07_notification.md`](../page/07_notification.md), [`docs/page/05_workout.md`](../page/05_workout.md)

## 1. 목표

Android 사용자가 앱을 다시 열지 않고 알림 영역에서 현재 운동 상태와 경과 시간을 확인하고 다음 동작을 실행할 수 있게 한다.

- 유산소 시작
- 운동 일시정지
- 운동 재개
- 운동 종료

iOS Live Activity와 같은 운동 command 의미를 사용하되, Android 시스템 UI에 맞게 ongoing notification으로 제공한다. iOS Dynamic Island와 동일한 화면을 복제하는 것이 아니라 Android의 표준 알림 경험을 사용한다.

## 2. v1 결정

v1은 Kotlin 네이티브 ongoing notification과 notification action receiver로 구현한다.

- Android 네이티브 구현 언어: Kotlin
- 앱 운동 상태와 완료 저장: TypeScript
- Expo prebuild 설정: `plugins/with-workout-session.js`
- 알림 렌더링: `NotificationCompat`
- action 수신: `BroadcastReceiver` 또는 동일 역할의 명시적 `PendingIntent` 대상
- 경과 시간: Android 시스템 chronometer
- foreground service: 사용하지 않음
- Android 센서/Health Connect 연동: 포함하지 않음

알림 표시와 버튼 반응을 위해 사용하지 않는 센서 권한이나 foreground service를 추가하지 않는다.

## 3. 표시 조건과 수명주기

- 운동 상태가 `recording` 또는 `paused`이고 `sessionId`가 있을 때 같은 notification identifier로 알림을 시작하거나 갱신한다.
- 운동이 `idle` 또는 `completed`가 되면 알림을 제거한다.
- 알림은 저소음 전용 channel을 사용하고 매 상태 갱신마다 소리나 진동을 반복하지 않는다.
- 사용자가 알림 본문을 누르면 현재 운동 화면을 연다.
- OS 알림 권한이 없거나 채널이 꺼져 있어도 운동 시작과 기록 자체를 막지 않는다.
- 앱 재시작 시 저장된 진행 중 운동과 미처리 command를 먼저 복구한 뒤 알림을 동기화한다.
- 이미 `finish` command가 있거나 완료된 세션의 알림을 앱 시작 과정에서 다시 생성하지 않는다.

## 4. 표시 내용

- 앱 이름 `옙버디`
- 상태 문구: `운동 기록 중`, `운동 일시정지`, `유산소 기록 중`, `유산소 일시정지`
- 운동 중 화면과 같은 기준의 경과 시간
- 현재 상태에 맞는 action 버튼

Android v1에서는 심박수와 칼로리를 표시하지 않는다. Android에서 해당 값을 지속적으로 제공하는 센서 또는 Health Connect 데이터 경로가 별도로 구현된 뒤 확장한다.

## 5. 상태별 action

Android 알림의 최대 action 수를 3개로 유지한다.

| 현재 상태 | 표시 action |
| --- | --- |
| 근력 운동 기록 중 | `유산소 시작`, `일시정지`, `운동 종료` |
| 유산소 기록 중 | `일시정지`, `운동 종료` |
| 근력 운동 일시정지 | `재개`, `운동 종료` |
| 유산소 일시정지 | `재개`, `운동 종료` |

지원하지 않는 action:

- 템포 화면 이동
- 저장하지 않고 종료하기
- 운동 부위, 세트 수, 메모 수정
- 광고, 프로모션, 구독 유도, 외부 이동

## 6. command 계약

Android와 iOS는 다음 command 값을 공유한다.

- `pause`
- `resume`
- `startCardio`
- `finish`

각 command는 최소한 다음 값을 가진다.

- `id`: 중복 처리 방지용 식별자
- `sessionId`: 적용 대상 운동 세션
- `command`: 실행할 명령
- `createdAt`: 사용자가 action을 실행한 시각

처리 원칙:

- 네이티브 receiver는 action 직후 알림의 버튼과 chronometer 상태를 먼저 갱신한다.
- command는 앱 프로세스 상태와 무관하게 잃지 않도록 네이티브 저장소에 큐로 보관한다.
- TypeScript의 `WorkoutProvider`는 현재 세션과 `sessionId`가 일치하는 command만 소비한다.
- 동일 `id`는 한 번만 처리한다.
- `pause`, `resume`, `startCardio`는 command의 `createdAt`을 상태 전이 시각으로 사용한다.
- `finish`는 알림을 즉시 닫고, 앱 command 소비 경로에서 완료 세션 저장과 권한 프롬프트 없는 후처리를 실행한다.
- `finish` 처리에서는 Alert나 자동 화면 이동을 실행하지 않는다.
- 앱이 실행 중이 아니어서 완료 저장이 지연되더라도 command를 보존하고 다음 앱 실행에서 완료 처리를 이어간다.

향후 `finish`를 앱 재실행 전에도 반드시 저장해야 하는 요구가 생기면 React Context 밖에서 실행 가능한 headless-safe 완료 함수를 분리하고 `expo-task-manager` 또는 Android headless task를 추가한다.

## 7. Kotlin과 TypeScript 책임

Kotlin 책임:

- ongoing notification 생성, 갱신, 제거
- notification channel과 고정 notification identifier 관리
- 시스템 chronometer 시작, 일시정지 상태 표시
- action `PendingIntent` 생성과 receiver 처리
- action 직후 알림 UI 갱신
- command 큐 저장과 React Native bridge 제공
- 지원 Android 버전에서 선택적인 Live Updates 승격

TypeScript 책임:

- 현재 운동 스냅샷 hydrate와 저장
- command 정규화, 세션 일치 검증, 중복 제거
- `pause`, `resume`, `startCardio` 상태 전이
- `finish` 완료 세션 저장
- 운동 리마인더 재동기화와 캘린더 자동 저장 후처리
- 운동 상태 변화에 따른 Android 알림 start/update/end 호출

## 8. 예상 변경 위치

- `docs/page/07_notification.md`
  - 구현 시 Android 알림 계획을 현재 동작으로 반영한다.
- `docs/page/05_workout.md`
  - 운동 중 화면과 Android 알림의 command 동등성을 기록한다.
- `src/entities/workout-session/api/liveActivity.ts`
  - 현재 iOS 전용 네이티브 모듈 선택을 Android ongoing activity까지 처리할 수 있는 공통 adapter로 확장한다.
- `src/entities/workout-session/model/WorkoutContext.tsx`
  - 기존 Live Activity start/update/end 및 command 소비 흐름을 Android와 공유한다.
- `src/entities/workout-session/model/sessionStorage.ts`
  - 앱 재시작과 command 소비 순서를 검증한다.
- `src/entities/workout-session/lib/notificationChannels.ts`
  - Android 진행 중 운동 전용 저소음 channel을 추가한다.
- `plugins/with-workout-session.js`
  - Kotlin 원본 복사, native module/receiver 등록, Android Manifest 설정을 prebuild에 반영한다.
- `plugins/android/workout-notification/*.kt`
  - Android 네이티브 구현의 source of truth로 사용한다.
- `src/shared/i18n/locales/ko.json`, `src/shared/i18n/locales/en.json`
  - Android 알림 상태와 action 문구를 추가한다.

생성된 `android/` 파일만 직접 수정하지 않고 config plugin과 원본 Kotlin 파일을 함께 관리한다.

## 9. Android 버전과 권한

- Android 8 이상에서는 전용 notification channel을 사용한다.
- Android 13 이상에서는 `POST_NOTIFICATIONS` 권한이 거부되면 알림 영역에서 운동을 조작할 수 없다.
- 권한 요청은 운동 시작 전에 별도 선행 프롬프트로 강제하지 않는다. 기존 알림 권한 정책과 사용자의 선택을 따른다.
- Android 16 이상 Live Updates는 v1 알림 위에 선택적으로 적용하는 progressive enhancement로 취급한다.
- Live Updates 승격은 사용자 설정이나 제조사 정책에 따라 거부될 수 있으므로 기본 ongoing notification 동작에 영향을 주면 안 된다.

## 10. v1 제외 범위

- foreground service
- `health` foreground service type과 관련 센서 권한
- Health Connect
- Android 심박수·활동 칼로리·총 칼로리 실시간 표시
- Wear OS 전용 UI
- Android 17 `MetricStyle` 전용 구현
- 알림에서 세트 수나 메모 편집

센서, 위치 또는 Health Connect 데이터를 화면이 꺼진 상태에서도 지속 수집해야 하는 요구가 생겼을 때만 `health` foreground service를 별도 설계한다.

## 11. 완료 조건

- 기록 시작 시 ongoing notification이 한 번만 표시된다.
- 알림 chronometer와 운동 화면의 경과 시간이 같은 기준을 사용한다.
- 기록 중 `일시정지`를 누르면 시간과 버튼이 즉시 일시정지 상태로 바뀐다.
- 일시정지 중 `재개`를 누르면 누적 일시정지 시간을 제외하고 시간이 이어진다.
- `유산소 시작`은 한 번만 적용되고 이후 버튼에서 사라진다.
- `운동 종료`는 알림을 즉시 제거하고 완료 command를 한 번만 처리한다.
- foreground, background, 프로세스 재생성 후 앱 재진입에서 command가 유실되거나 중복 처리되지 않는다.
- 오래된 세션의 action이 현재 세션 상태를 변경하지 않는다.
- 완료 또는 폐기한 운동의 알림이 앱 재시작 후 다시 나타나지 않는다.
- 알림 권한 거부와 채널 비활성화 상태에서도 운동 기록 기능은 정상 동작한다.
- Android 16 미만 기기에서도 기본 ongoing notification과 action이 동작한다.
