# 알림 기능서

> 현재 구현 기준으로 정리한 문서.  
> 범위: `앱 실행 시 권한 프롬프트 없는 동기화 → 설정 화면 알림 토글 ON/OFF → 운동 시작/종료 시 리마인더 갱신 → iOS Live Activity 운동 제어 → 프로틴 알림 탭 라우팅`

## 1. 문서 목적

이 문서는 YepBuddy의 알림 기능이 어떤 종류로 나뉘는지, 언제 예약/취소되는지, 어떤 사용자 액션에서 OS 권한 요청이 발생할 수 있는지를 비즈니스 관점에서 이해할 수 있도록 정리한 기능서다.

기획 아이디어나 희망사항이 아니라, 현재 코드에 연결되어 있는 실제 동작을 기준으로 작성한다.

## 2. 기능 한눈에 보기

현재 앱 알림은 4가지 축으로 동작한다.

1. 운동 리마인더 알림
2. 프로틴 세일 알림
3. 운동 장소 알림
4. iOS 운동 Live Activity

핵심 역할은 8가지다.

1. 앱 시작 시 저장된 enabled 상태와 현재 OS 권한 상태만 확인한다.
2. 자동 동기화 경로에서는 `requestPermissionsAsync()`를 호출하지 않는다.
3. 사용자가 설정 화면에서 알림 토글을 ON 하는 명시적 액션에서만 OS 알림 권한을 요청할 수 있다.
4. 권한이 없거나 꺼져 있으면 enabled 값을 false로 맞추고 남은 예약을 취소한다.
5. 운동 시작 직전 기존 운동 리마인더를 취소하고, 운동 종료 후 프롬프트 없이 다시 동기화한다.
6. 프로틴 세일 알림을 탭하면 프로틴 탭으로 이동시킨다.
7. 사용자가 등록한 운동 장소 도착 알림을 탭하면 운동일지에서 운동 시작 확인 Alert를 띄운다.
8. 운동 중에는 iOS 잠금화면 Live Activity로 일시정지/재개, 유산소 시작, 운동 종료를 제어할 수 있다.

## 3. 사용자 흐름

```text
앱 실행
  └─ 루트 레이아웃 초기화
      ├─ 프로틴 세일 알림 핸들러 등록
      ├─ 저장된 프로틴 세일 알림 활성 상태 확인
      │   └─ 활성 상태면 현재 권한만 확인하고 향후 세일 알림 재예약
      └─ 저장된 운동 리마인더 활성 상태 확인
          └─ 활성 상태면 현재 권한과 오늘 운동 기록을 확인하고 다음 22:00 알림 재예약
      └─ 저장된 운동 장소 알림 활성 상태 확인
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
  ├─ 등록된 헬스장 위치 버튼
  │   └─ 자동 학습 장소 목록 하단시트와 개별 삭제 제공
  ├─ 운동 장소 알림 토글 ON
  │   ├─ OS 알림 권한 확인/요청 가능
  │   ├─ foreground 위치 권한 확인/요청 가능
  │   ├─ background 위치 권한 확인/요청 가능
  │   ├─ 권한 허용 → 최근 장소 최대 20개의 50m Enter geofence 등록 및 enabled true 저장
  │   └─ 권한 거부 → enabled false 저장, geofence 중지, 동기화 상태 저장
  └─ 운동 장소 알림 토글 OFF
      └─ enabled false 저장 및 geofence 중지

운동 시작 카드 탭
  └─ 카운트다운 화면 진입
      └─ 기존 운동 리마인더 취소
      └─ iOS 운동 Live Activity 시작 또는 갱신

운동 종료
  └─ 로컬 세션/헬스킷/캘린더 저장 흐름
      └─ 결과 화면에 저장된 위치로 운동 장소 자동 학습
      └─ iOS 운동 Live Activity 종료
      └─ 운동 리마인더 권한 프롬프트 없이 재동기화
      └─ 완료한 로컬 날짜의 남은 시간 동안 장소 알림 차단

프로틴 세일 알림 탭
  └─ 알림 payload kind 확인
      └─ kind가 프로틴 세일이면 /protein으로 이동

운동 장소 도착 알림 탭
  └─ 알림 payload type 확인
      └─ type이 workout-place-arrival이면 운동일지로 이동
          └─ 운동 시작 확인 Alert 표시

```

## 4. 화면 범위

| 화면             | 경로                  | 역할                                                                                                                  |
| ---------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 앱 루트 레이아웃 | `src/app/_layout.tsx` | 알림 핸들러 등록, 권한 프롬프트 없는 초기 동기화 실행                                                                 |
| 설정 화면        | `/settings`           | 운동 리마인더와 프로틴 세일 알림 수신 동의 ON/OFF 제어                                                                |
| 설정 화면        | `/settings`           | 자동 학습된 운동 장소 목록 조회·삭제와 geofence ON/OFF 제어                                                           |
| 카운트다운 화면  | `/workout/countdown`  | 운동 시작 직전 기존 운동 리마인더 취소                                                                                |
| 운동 중 화면     | `/workout/active`     | iOS Live Activity 시작/갱신/종료, Live Activity action 처리, 운동 종료 시 운동 리마인더를 권한 프롬프트 없이 재동기화 |
| 프로틴 목록 화면 | `/protein`            | 프로틴 세일 알림 탭 라우팅 대상                                                                                       |
| 운동일지 화면    | `/`                   | 장소 도착 알림 탭 후 운동 시작 확인 Alert 표시                                                                        |

## 5. 기능 상세

### 5.1 앱 시작·활성화 시 초기화

루트 레이아웃 `useEffect`에서 알림 관련 초기 작업을 한 번 수행하고, 앱이 다시 active가 될 때 운동 장소 알림을 현재 권한과 만료 상태에 맞춰 재동기화한다.

현재 동작:

- 프로틴 세일 알림 응답 핸들러를 등록한다.
- 저장된 프로틴 세일 알림 활성 상태가 true면 현재 권한 상태만 확인하고 일정 재동기화를 수행한다.
- 저장된 운동 리마인더 활성 상태가 true면 현재 권한 상태만 확인하고 운동 리마인더를 재동기화한다.
- 앱이 active로 돌아오면 운동 장소 geofence를 권한 프롬프트 없이 동기화한다.
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
- 알림 본문에는 루틴 사이클 남은 횟수 같은 개인 진행률을 포함하지 않는다.

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
- 캘린더 자동 저장 선호 상태를 처리하기 전에 호출해, 사용자가 1회성 Alert를 닫아도 리마인더 상태가 최신 상태로 맞춰진다.
- 이 경로에서는 OS 알림 권한 요청 프롬프트를 띄우지 않는다.

### 5.4 iOS 운동 Live Activity

iOS 운동 Live Activity는 현재 진행 중인 운동 세션에 대해서만 사용한다. 일반 `expo-notifications` notification action이 아니라 ActivityKit Widget Extension으로 렌더링한다.

표시 조건:

- 운동 상태가 `recording` 또는 `paused`이고 `sessionId`가 있을 때 시작 또는 갱신한다.
- 운동이 `idle` 또는 `completed`가 되면 Live Activity를 종료한다.
- iOS ActivityKit을 사용할 수 없거나 Live Activity가 비활성화된 환경에서는 운동 자체를 막지 않는다.

잠금화면 표시:

- 앱 이름 `옙버디`
- 상태 문구: `운동 기록 중`, `운동 일시정지`, `유산소 기록 중`, `유산소 일시정지`
- 운동 중 화면과 같은 기준의 경과 시간
- 현재 심박수가 `0`보다 클 때 `heart.fill`, 정수 심박수, `BPM`
- 유산소 시작 이미지 버튼 `figure.run`
- 일시정지/재개 이미지 버튼 `pause.fill` / `play.fill`
- 운동 종료 이미지 버튼 `stop.fill`

현재 Dynamic Island 표시:

- Expanded leading: `옙버디`와 현재 상태 문구
- Expanded trailing: 경과 시간, 유산소 기록 중 `figure.run`, 값이 있을 때 현재 심박수와 `BPM`
- Expanded bottom: 유산소 시작, 일시정지/재개, 운동 종료 제어 버튼
- Compact leading/minimal: 근력 운동 중 `figure.strengthtraining.traditional`, 유산소 기록 중 `figure.run`
- Compact trailing: 값이 있을 때 `heart.fill`과 정수 심박수
- 심박수가 없거나 `0`이면 `--` 없이 심박수 영역을 숨긴다.

심박수 갱신:

- 운동 화면 상태의 심박수는 foreground와 HealthKit 샘플 fallback 값을 Live Activity에 전달한다.
- iPhone HealthKit live metric이 들어오면 네이티브 경로에서도 Live Activity를 갱신해 잠금 중 JS 중단 영향을 줄인다.
- 일시적으로 빈 값이 들어오면 운동 화면과 같이 직전 정상 심박수를 유지한다.

Live Activity action:

- `pause`: 기록 중인 운동을 일시정지하고 HealthKit live workout session pause를 시도한다.
- `resume`: 일시정지된 운동을 재개하고 HealthKit live workout session resume을 시도한다.
- `startCardio`: 기록 중이고 아직 유산소가 시작되지 않았을 때 `cardioStartedAt`을 기록한다.
- `finish`: Live Activity를 즉시 닫고, 앱 쪽 command 소비 경로에서 완료 세션 저장을 처리한다.

action 처리 원칙:

- 하단 드로어와 Live Activity는 같은 운동 command 의미를 사용한다.
- HealthKit 호출 실패는 로컬 운동 상태 전환을 되돌리지 않는다.
- `finish` 경로에서는 Alert, 화면 이동, 캘린더 권한 요청을 실행하지 않는다.
- `finish` 이후 사용자가 앱을 열면 운동 중 화면에 남지 않고 메인 화면으로 돌아간다.

지원하지 않는 action:

- 템포 화면 이동
- 저장하지 않고 종료하기
- 광고, 프로모션, 구독 유도, 외부 이동

### 5.5 프로틴 세일 알림

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

### 5.5.1 Android 알림 채널

Android에서는 다음 notification channel을 사용한다.

| 채널 ID                 | 소유 모듈                  | 용도                            |
| ----------------------- | -------------------------- | ------------------------------- |
| `workout-reminders`     | `entities/workout-session` | 매일 22:00 운동 리마인더        |
| `workout-place-arrival` | `entities/workout-session` | 자동 학습된 운동 장소 도착 알림 |
| `protein-sale`          | `entities/protein`         | 마이프로틴 세일 알림            |

### 5.6 프로틴 알림 탭 라우팅

프로틴 세일 알림 응답 핸들러는 payload의 `kind`를 확인해서 라우팅한다.

동작 규칙:

- `kind === myproteinSale`이면 `/protein`으로 이동한다.
- 동일 notification identifier는 중복 처리하지 않도록 캐시한다.
- 처리 후 `clearLastNotificationResponseAsync()`로 마지막 응답을 정리한다.

### 5.7 운동 장소 알림

운동 장소 알림은 `entities/workout-session/lib/workoutPlaceArrivalReminder.ts`에서 관리한다.

장소 판정:

- 결과 화면에 사용하는 저장 위치가 유효한 완료 세션에서 운동 장소를 자동 학습한다.
- 앱 시작 시 기존 완료 세션의 결과 위치로 장소 목록을 다시 계산한 뒤 장소 알림을 동기화한다.
- 새 장소 표본이 기존 장소의 최신 좌표에서 `50m` 이내면 같은 장소로 병합하고 좌표를 새 표본으로 갱신한다.
- 최근 방문 순 최대 20개 장소를 앱을 깨우기 위한 반경 `50m` Enter-only geofence로 등록한다.
- 설정의 `등록된 헬스장 위치` 하단시트에서 학습된 장소 목록을 확인하고 삭제할 수 있다.

권한 규칙:

- 결과 위치로 저장되는 운동 시작 위치는 사용자 운동 시작 흐름에서 foreground 위치 권한을 요청할 수 있다. 운동 종료와 장소 학습은 새 권한 프롬프트를 띄우지 않는다. `운동 장소 알림` ON은 알림 권한, foreground 위치 권한, background 위치 권한을 요청할 수 있다.
- 앱 시작과 자동 재동기화에서는 현재 권한 상태만 확인한다.
- 자동 동기화에서 권한이 꺼져 있으면 enabled 값은 유지하고 geofence 등록 중지와 동기화 상태 저장만 수행한다.
- 토글 OFF는 장소 목록을 유지하고 geofence만 중지한다. 마지막 장소 삭제는 OFF로 전환한다.

알림 규칙:

- OS geofence Enter 이벤트는 알림 후보 신호다. 이벤트만으로 바로 알림을 보내지 않는다.
- Enter 이벤트를 받으면 현재 위치를 한 번 확인한다.
- 현재 위치 정확도가 `20m` 이내이고 등록 위치까지의 거리가 `50m` 이내일 때만 운동 시작 제안 알림을 보낸다.
- 단발 확인 시점에 등록 위치에서 `50m` 밖이면 해당 진입에서는 알림이 없고, 지속 위치 추적이나 재시도는 하지 않는다.
- `countdown`, `recording`, `paused` 상태에서는 알림을 보내지 않는다.
- 운동 완료일 또는 마지막 도착 알림 발송일이 오늘과 같으면 차단하고 로컬 날짜가 바뀌면 다시 허용한다.
- Exit 이벤트와 운동 종료 누락 리마인더는 사용하지 않는다.
- 도착 알림 data에는 `type: "workout-place-arrival"`와 실제 도착한 장소의 `placeId`만 포함한다.
- 알림 제목/본문에는 주소, 좌표, 운동 기록 상세를 포함하지 않는다.
- OS geofence 이벤트에 의존하므로 알림이 지연되거나 전달되지 않을 수 있다.

탭 동작:

- 운동 시작 제안 알림을 누르면 운동일지 화면으로 이동한다.
- 운동일지에서 `운동을 시작하시겠어요?` 확인 Alert를 표시한다.
- `운동 시작`을 누르면 진행 중 운동이 없을 때 `/workout/countdown`으로 이동한다.
- 이미 진행 중인 운동이 있으면 `/workout/active`로 이동한다.

### 5.8 헬스장 도착 정책

OS의 50m Enter 이벤트는 앱을 깨우는 후보 신호다. 이벤트 후 현재 위치를 한 번 조회해 등록 위치까지의 거리가 50m 이내이고 정확도가 20m 이내인지 확인한 뒤, 현재 운동 상태와 당일 알림 제한을 적용해 결정한다.

장소 유형, 이동 방향, 위치 sample, context, noise score를 계산하는 정책 엔진은 사용하지 않는다. Exit 이벤트와 운동 종료 누락 리마인더도 제공하지 않는다.

#### 5.8.1 사용자가 보는 알림

| 알림           | 사용자가 보는 상황                               | 탭 후 동작                             |
| -------------- | ------------------------------------------------ | -------------------------------------- |
| 운동 시작 제안 | 자동 학습된 운동 장소 중 한 곳의 50m 안에 도착함 | 운동일지에서 운동 시작 확인 Alert 표시 |

#### 5.8.2 알림을 보내지 않는 상황

다음 상황에는 도착 알림을 보내지 않는다.

| 상황                                                      | 사용자 경험 |
| --------------------------------------------------------- | ----------- |
| 현재 위치를 얻지 못함                                     | 알림 없음   |
| 위치 정확도가 `20m`보다 나쁨                              | 알림 없음   |
| 휴대폰이 알려준 현재 위치가 실제 지구상 위치로 볼 수 없음 | 알림 없음   |
| 등록 위치에서 `50m`보다 멂                                | 알림 없음   |
| 운동 카운트다운, 기록 또는 일시정지 중임                  | 알림 없음   |
| 오늘 운동을 완료함                                        | 알림 없음   |
| 오늘 장소 도착 알림을 이미 발송함                         | 알림 없음   |

의미: 애매하거나 부정확한 위치로 사용자를 방해하지 않는다.

#### 5.8.3 운동 시작 제안 알림이 뜨는 경우

| 조건            | 기준                                                                         |
| --------------- | ---------------------------------------------------------------------------- |
| 등록 장소       | 완료 운동에서 자동 학습한 장소가 있음                                        |
| geofence 이벤트 | 반경 `50m` Enter 이벤트를 받음                                               |
| 재검증 위치     | 현재 위치 정확도 `20m` 이내, 등록 위치까지 거리 `50m` 이내                   |
| 운동 상태       | `idle` 또는 `completed`                                                      |
| 재알림 제한     | 마지막 운동 완료일과 마지막 알림 발송일이 오늘이 아님                        |

#### 5.8.4 당일 알림 제한

운동 완료와 알림 발송은 하나의 당일 제한 시각을 공유한다.

- 장소 학습과 기존 장소 이전은 당일 제한을 시작하지 않는다.
- 운동을 완료하면 해당 로컬 날짜의 남은 시간 동안 알림을 차단한다.
- 도착 알림 예약이 성공하면 해당 로컬 날짜의 남은 시간 동안 알림을 차단한다.
- 기기 로컬 날짜가 바뀌면 다시 허용한다.

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

### 6.3 운동 장소 알림

- `yb:workout-place-reminder:enabled`
  - 값: `"true"` / `"false"`
- `yb:workout-place-reminder:places`
  - 값: 자동 학습 장소 최대 20개의 좌표, 라벨, 방문 정보(JSON)
- `yb:workout-place-reminder:cooldown-started-at`
  - 값: 운동 완료 또는 알림 성공 중 가장 최근 시각. 로컬 날짜 당일 차단 기준
- `yb:workout-place-reminder:pending-prompt`
  - 값: 알림 탭 후 운동일지에서 표시할 pending prompt(JSON)
- `yb:workout-place-reminder:sync-status`
  - 값: 현재 geofence가 동작 가능한지와 실패 이유(JSON)

### 6.4 iOS 운동 Live Activity

- `yb:workout-live-activity:commands`
  - 값: Live Activity AppIntent가 생성한 운동 command 배열(JSON)
  - command 값: `pause`, `resume`, `startCardio`, `finish`
  - 앱은 command를 소비한 뒤 이 키를 비운다.

## 7. 현재 제약과 참고사항

1. 운동 리마인더는 “22:00 고정 시각 + 오늘 운동 완료 시 다음 날로 이월” 정책으로 동작한다.
2. 운동 리마인더와 프로틴 세일 알림은 서로 다른 저장 키/취소 경로를 사용하므로 서로를 직접 취소하지 않는다.
3. 자동 동기화 경로는 OS 알림 권한 요청을 시작하지 않는다.
4. 운동 장소 알림은 OS geofence 정책에 따라 지연되거나 전달되지 않을 수 있다.
5. `syncWorkoutPlaceArrivalReminder`는 `allowPrompt: false`에서 권한이 없으면 geofence를 중지하고 `operational=false`를 저장하지만, 사용자의 enabled 의도는 보존한다.
6. 프로틴 세일과 운동 장소 알림은 응답 핸들러가 있지만, 운동 리마인더의 `kind: workoutReminder`를 처리하는 별도 탭 라우팅은 현재 없다.
7. iOS 운동 Live Activity는 ActivityKit 기능이며 Android 알림 채널을 사용하지 않는다.
8. Dynamic Island 제어 버튼은 Expanded 표시에서만 제공하며 Compact와 Minimal 표시는 상태 아이콘과 심박수 정보만 제공한다.
