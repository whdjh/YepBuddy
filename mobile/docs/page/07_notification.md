# 알림 기능서

> 현재 구현 기준으로 정리한 문서.  
> 범위: `앱 실행 시 권한 프롬프트 없는 동기화 → 설정 화면 알림 토글 ON/OFF → 운동 시작/종료 시 리마인더 갱신 → 프로틴 알림 탭 라우팅`

## 1. 문서 목적

이 문서는 YepBuddy의 알림 기능이 어떤 종류로 나뉘는지, 언제 예약/취소되는지, 어떤 사용자 액션에서 OS 권한 요청이 발생할 수 있는지를 비즈니스 관점에서 이해할 수 있도록 정리한 기능서다.

기획 아이디어나 희망사항이 아니라, 현재 코드에 연결되어 있는 실제 동작을 기준으로 작성한다.

## 2. 기능 한눈에 보기

현재 앱 알림은 3가지 축으로 동작한다.

1. 운동 리마인더 알림
2. 프로틴 세일 알림
3. 운동 장소 도착 알림

핵심 역할은 7가지다.

1. 앱 시작 시 저장된 enabled 상태와 현재 OS 권한 상태만 확인한다.
2. 자동 동기화 경로에서는 `requestPermissionsAsync()`를 호출하지 않는다.
3. 사용자가 설정 화면에서 알림 토글을 ON 하는 명시적 액션에서만 OS 알림 권한을 요청할 수 있다.
4. 권한이 없거나 꺼져 있으면 enabled 값을 false로 맞추고 남은 예약을 취소한다.
5. 운동 시작 직전 기존 운동 리마인더를 취소하고, 운동 종료 후 프롬프트 없이 다시 동기화한다.
6. 프로틴 세일 알림을 탭하면 프로틴 탭으로 이동시킨다.
7. 반복 운동 장소 근처 도착 알림을 탭하면 운동일지에서 운동 시작 확인 Alert를 띄운다.

## 3. 사용자 흐름

```text
앱 실행
  └─ 루트 레이아웃 초기화
      ├─ 프로틴 세일 알림 핸들러 등록
      ├─ 저장된 프로틴 세일 알림 활성 상태 확인
      │   └─ 활성 상태면 현재 권한만 확인하고 향후 세일 알림 재예약
      └─ 저장된 운동 리마인더 활성 상태 확인
          └─ 활성 상태면 현재 권한과 오늘 운동 기록을 확인하고 다음 22:00 알림 재예약
      └─ 저장된 운동 장소 도착 알림 활성 상태 확인
          └─ 활성 상태면 현재 권한만 확인하고 geofence 재등록

설정 화면
  ├─ 운동 리마인더 토글 ON
  │   ├─ OS 알림 권한 확인
  │   ├─ 권한이 없으면 OS 알림 권한 요청 가능
  │   ├─ 권한 허용 → 오늘 운동 기록을 반영한 다음 22:00 알림 예약 및 enabled true 저장
  │   └─ 권한 거부 → enabled false 저장 및 예약 취소
  ├─ 운동 리마인더 토글 OFF
  │   └─ enabled false 저장 및 예약 취소
  ├─ 프로틴 세일 알림 토글 ON
  │   ├─ OS 알림 권한 확인
  │   ├─ 권한이 없으면 OS 알림 권한 요청 가능
  │   ├─ 권한 허용 → 향후 세일 알림 예약 및 enabled true 저장
  │   └─ 권한 거부 → enabled false 저장 및 예약 취소
  └─ 프로틴 세일 알림 토글 OFF
      └─ enabled false 저장 및 예약 취소
  ├─ 운동 장소 도착 알림 토글 ON
  │   ├─ OS 알림 권한 확인/요청 가능
  │   ├─ foreground 위치 권한 확인/요청 가능
  │   ├─ background 위치 권한 확인/요청 가능
  │   ├─ 권한 허용 → 반복 운동 장소 geofence 등록 및 enabled true 저장
  │   └─ 권한 거부 → enabled false 저장, geofence 중지, 동기화 상태 저장
  └─ 운동 장소 도착 알림 토글 OFF
      └─ enabled false 저장 및 geofence 중지

운동 시작 카드 탭
  └─ 카운트다운 화면 진입
      └─ 기존 운동 리마인더 취소

운동 종료
  └─ 로컬 세션/헬스킷/캘린더 저장 흐름
      └─ 운동 리마인더 권한 프롬프트 없이 재동기화
      └─ 장소 히스토리 반영 후 장소 도착 알림 권한 프롬프트 없이 재동기화

프로틴 세일 알림 탭
  └─ 알림 payload kind 확인
      └─ kind가 프로틴 세일이면 /protein으로 이동

운동 장소 도착 알림 탭
  └─ 알림 payload type 확인
      └─ type이 workout-place-arrival이면 운동일지로 이동
          └─ 운동 시작 확인 Alert 표시
```

## 4. 화면 범위

| 화면 | 경로 | 역할 |
| --- | --- | --- |
| 앱 루트 레이아웃 | `src/app/_layout.tsx` | 알림 핸들러 등록, 권한 프롬프트 없는 초기 동기화 실행 |
| 설정 화면 | `/settings` | 운동 리마인더와 프로틴 세일 알림 수신 동의 ON/OFF 제어 |
| 설정 화면 | `/settings` | 운동 장소 도착 알림 권한 동의와 geofence ON/OFF 제어 |
| 카운트다운 화면 | `/workout/countdown` | 운동 시작 직전 기존 운동 리마인더 취소 |
| 운동 중 화면 | `/workout/active` | 운동 종료 시 운동 리마인더를 권한 프롬프트 없이 재동기화 |
| 프로틴 목록 화면 | `/protein` | 프로틴 세일 알림 탭 라우팅 대상 |
| 운동일지 화면 | `/` | 장소 도착 알림 탭 후 운동 시작 확인 Alert 표시 |

## 5. 기능 상세

### 5.1 앱 시작 시 초기화

루트 레이아웃 `useEffect`에서 알림 관련 초기 작업을 한 번 수행한다.

현재 동작:

- 프로틴 세일 알림 응답 핸들러를 등록한다.
- 저장된 프로틴 세일 알림 활성 상태가 true면 현재 권한 상태만 확인하고 일정 재동기화를 수행한다.
- 저장된 운동 리마인더 활성 상태가 true면 현재 권한 상태만 확인하고 운동 리마인더를 재동기화한다.
- 초기화 경로에서는 OS 알림 권한 요청 프롬프트를 띄우지 않는다.

의미:

- 앱을 다시 켤 때도 사용자가 저장한 설정과 현재 OS 권한 상태를 존중한다.
- 사용자가 OS Settings에서 알림 권한을 끈 경우 앱 시작 시 enabled 값을 false로 맞추고 남은 예약을 취소한다.

### 5.2 운동 리마인더 정책

운동 리마인더는 `entities/workout-session/lib/reminder.ts`에서 관리한다.

현재 정책:

- 기준 시각은 매일 `22:00`이다.
- 동기화 시 기존 운동 리마인더 1건을 취소하고 새로 1건만 예약한다.
- 현재 시각이 22:00 이전이고 오늘 운동 기록이 없으면 오늘 22:00에 예약한다.
- 오늘 운동 기록이 있으면 오늘 22:00은 건너뛰고 다음 날 22:00에 예약한다.
- 현재 시각이 22:00 이후면 다음 날 22:00에 예약한다.
- 알림 본문은 `workout.reminder.body` 기본 문구를 사용한다.
- 알림 본문에는 주간 루틴 남은 횟수 같은 개인 진행률을 포함하지 않는다.

권한 규칙:

- `syncWorkoutReminderAtNight({ allowPrompt: true })`에서만 `Notifications.requestPermissionsAsync()`를 호출할 수 있다.
- `syncWorkoutReminderAtNight({ allowPrompt: false })`는 `Notifications.getPermissionsAsync()`만 호출한다.
- 권한이 없으면 enabled 값을 false로 저장하고 기존 예약을 취소한다.

### 5.3 운동 시작/종료와 리마인더 연계

#### 5.3.1 카운트다운 진입 시 취소

- 카운트다운 화면 진입 시 `cancelScheduledWorkoutReminder()`를 호출한다.
- 의미: 사용자가 지금 운동을 시작했으므로 기존 “운동하러 가자” 알림은 불필요하다고 보고 즉시 정리한다.

#### 5.3.2 운동 종료 시 재동기화

- 운동 중 화면에서 완료 세션 저장과 HealthKit 종료 처리 이후 `syncWorkoutReminderAtNight({ allowPrompt: false })`를 호출한다.
- 완료 세션이 오늘 기록으로 저장되어 있으면 같은 날 22:00 리마인더를 다시 예약하지 않는다.
- 캘린더 등록 안내 Alert를 띄우기 전에 호출해, 사용자가 Alert를 닫아도 리마인더 상태가 최신 상태로 맞춰진다.
- 이 경로에서는 OS 알림 권한 요청 프롬프트를 띄우지 않는다.

### 5.4 프로틴 세일 알림

프로틴 세일 알림은 `entities/protein/lib/protein-sale-notification` 모듈에서 관리한다.

현재 특성:

- 플랫폼: iOS와 Android에서 동작한다.
- Android는 알림 채널 `protein-sale`을 사용한다.
- Android 13+에서는 채널 생성 후 OS 알림 권한 프롬프트가 표시될 수 있다.
- 설정 화면의 토글 ON 시:
  - 권한 확인
  - 권한이 없으면 OS 알림 권한 요청 가능
  - 기존 프로틴 세일 알림 전체 취소
  - 고정 세일 일정 + 블랙프라이데이 기반 일정 예약
  - 예약 ID 목록 저장
  - 활성 상태 저장
- 토글 OFF 시:
  - 활성 상태 false 저장
  - 예약 전체 취소
- 앱 시작 자동 동기화 시:
  - 저장된 enabled 상태와 현재 권한 상태만 확인한다.
  - 권한 요청 프롬프트를 띄우지 않는다.
  - 권한이 없으면 enabled 값을 false로 저장하고 예약을 취소한다.

알림 시각 규칙:

- 고정 세일: 세일 시작일 전날 19:00
- 블랙프라이데이: 해당 연도 11월 마지막 금요일 전날 19:00
- 현재 연도 + 다음 연도 일정 중 “지금 이후” 일정만 예약

### 5.4.1 Android 알림 채널

Android에서는 다음 notification channel을 사용한다.

| 채널 ID | 소유 모듈 | 용도 |
| --- | --- | --- |
| `workout-reminders` | `entities/workout-session` | 매일 22:00 운동 리마인더 |
| `workout-place-arrival` | `entities/workout-session` | 반복 운동 장소 도착 알림 |
| `protein-sale` | `entities/protein` | 마이프로틴 세일 알림 |

### 5.5 프로틴 알림 탭 라우팅

프로틴 세일 알림 응답 핸들러는 payload의 `kind`를 확인해서 라우팅한다.

동작 규칙:

- `kind === myproteinSale`이면 `/protein`으로 이동한다.
- 동일 notification identifier는 중복 처리하지 않도록 캐시한다.
- 처리 후 `clearLastNotificationResponseAsync()`로 마지막 응답을 정리한다.

### 5.6 운동 장소 도착 알림

운동 장소 도착 알림은 `entities/workout-session/lib/workoutPlaceArrivalReminder.ts`에서 관리한다.

장소 판정:

- 완료 세션에 위치가 있는 경우만 장소 후보로 사용한다.
- 기존 장소 중심점 기준 120m 이내면 같은 장소로 묶는다.
- 같은 장소 완료 운동이 2회 이상이면 geofence 등록 후보가 된다.
- geofence 반경은 150m다.
- 등록 후보가 20개를 넘으면 최근 운동일, 운동 횟수 순으로 최대 20개만 등록한다.

권한 규칙:

- 설정 화면에서 사용자가 `운동 장소 도착 알림`을 ON 하는 경우에만 알림 권한, foreground 위치 권한, background 위치 권한을 요청할 수 있다.
- 앱 시작, 운동 종료, 운동 기록 삭제 후 재동기화에서는 현재 권한 상태만 확인한다.
- 자동 동기화에서 권한이 꺼져 있으면 enabled 값은 유지하고 geofence 등록 중지와 동기화 상태 저장만 수행한다.

알림 규칙:

- OS geofence Enter 이벤트에서만 알림을 보내고, Exit 이벤트는 마지막 이벤트 상태만 저장한다.
- 같은 장소는 하루 1회만 알림을 보낸다.
- 알림 data에는 `type: "workout-place-arrival"`과 `placeId`만 포함한다.
- 알림 제목/본문에는 주소, 좌표, 운동 기록 상세를 포함하지 않는다.
- OS geofence 이벤트에 의존하므로 알림이 지연되거나 전달되지 않을 수 있다.

탭 동작:

- 알림을 누르면 운동일지 화면으로 이동한다.
- 운동일지에서 `운동을 시작하시겠어요?` 확인 Alert를 표시한다.
- `운동 시작`을 누르면 진행 중 운동이 없을 때 `/workout/countdown`으로 이동한다.
- 이미 진행 중인 운동이 있으면 `/workout/active`로 이동한다.

## 6. 저장소 키

### 6.1 운동 리마인더

- `yb:workout:reminder`
  - 값: 현재 예약된 운동 리마인더 notification identifier 1건
- `yb:workout:reminder:enabled`
  - 값: `"true"` / `"false"`
  - `"true"`일 때만 활성 상태로 본다.

### 6.2 프로틴 세일 알림

- `yb:protein-sale-notification:enabled`
  - 값: `"true"` / `"false"`
- `yb:protein-sale-notification:ids`
  - 값: 예약된 프로틴 세일 notification identifier 배열(JSON)

### 6.3 운동 장소 도착 알림

- `yb:workout-place-reminder:enabled`
  - 값: `"true"` / `"false"`
- `yb:workout-place-reminder:places`
  - 값: 반복 운동 장소 후보 배열(JSON)
- `yb:workout-place-reminder:pending-prompt`
  - 값: 알림 탭 후 운동일지에서 표시할 pending prompt(JSON)
- `yb:workout-place-reminder:sync-status`
  - 값: enabled, operational, 권한 상태, 등록 region, 마지막 geofence 이벤트 상태(JSON)

## 7. 현재 제약과 참고사항

1. 운동 리마인더는 “22:00 고정 시각 + 오늘 운동 완료 시 다음 날로 이월” 정책으로 동작한다.
2. 운동 리마인더와 프로틴 세일 알림은 서로 다른 저장 키/취소 경로를 사용하므로 서로를 직접 취소하지 않는다.
3. 자동 동기화 경로는 OS 알림 권한 요청을 시작하지 않는다.
4. 장소 도착 알림은 OS geofence 정책에 따라 지연되거나 전달되지 않을 수 있다.
5. `syncWorkoutPlaceArrivalReminder`는 `allowPrompt: false`에서 권한이 없으면 geofence를 중지하고 `operational=false`를 저장하지만, 사용자의 enabled 의도는 보존한다.
6. 프로틴 세일과 장소 도착 알림은 응답 핸들러가 있지만, 운동 리마인더의 `kind: workoutReminder`를 처리하는 별도 탭 라우팅은 현재 없다.
