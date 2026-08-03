# Entities Guide

`entities`는 앱의 도메인 데이터와 도메인 side effect를 다룬다. 화면 흐름, 라우팅, 화면 전용 UI 상태는 `features`나 `app`에서 처리한다.

이 문서는 `src/entities`를 수정하는 에이전트가 따라야 할 기준이다. 리팩토링은 동작을 보존하는 작업이어야 하며, 경계 이동이나 공통화는 아래 규칙으로 설명 가능해야 한다.

## 에이전트 리팩토링 계약

리팩토링 전에 이 문서 전체를 먼저 읽고, 변경 이유를 아래 기준 중 하나로 분류한다.

- 경계 정리: entity가 route, 화면 흐름, 화면 전용 UI 상태를 알고 있어서 `features`나 `app`으로 내린다.
- 방어 로직: 저장소/외부 API/네이티브 브리지에서 들어오는 값을 검증하고 앱 타입으로 정규화한다.
- 공통화: 도메인 의미가 없고 세 번째 사용처가 예상되는 순수 유틸만 `shared`로 올린다.
- UI 토큰 정리: hardcoded 색상/primitive token 직접 접근을 `shared` token/hook으로 바꾼다.
- 죽은 코드 제거: 실제 import가 없고 공개 API에서도 쓰이지 않는 내부 파일만 삭제한다.

위 분류로 설명되지 않는 변경은 이 문서 기준의 리팩토링이 아니다. 기능 변경, 저장 구조 변경, route 변경, 사용자 문구 변경은 별도 요구사항이 있을 때만 한다.

반드시 지킬 규칙:

- entity 외부에서는 각 entity의 `index.ts`만 import한다.
- entity 내부에서는 같은 entity의 `api`, `model`, `lib`, `ui`를 상대 경로로 import한다.
- entity에서 Expo Router, 화면 경로 문자열, navigation policy를 직접 알지 않는다.
- storage key, notification type/channel/task name, Supabase table/RPC 이름은 기존 값을 유지한다.
- AsyncStorage에 저장된 기존 JSON은 깨져 있을 수 있다고 보고 읽을 때 정규화한다.
- 외부 API 실패는 호출 성격에 맞게 `false`, `null`, `[]`, throw 중 하나로 명확히 표현한다.
- `primitive.json`은 `shared/lib/designTokens`에서만 직접 읽는다.
- 타입 오류를 없애기 위해 `as any`, 넓은 `as never`, 넓은 `unknown` cast를 새로 늘리지 않는다. 네이티브 라이브러리 타입 한계 때문에 이미 필요한 곳은 좁게 유지한다.
- 리팩토링 커밋에는 문서 정리, 포맷 변경, 기능 변경을 무리하게 섞지 않는다.

리팩토링 절차:

1. `rg`로 현재 import/use site를 확인한다.
2. 바꿀 코드가 도메인 규칙인지, 화면 흐름인지, 순수 유틸인지 먼저 분류한다.
3. public export가 바뀌면 해당 entity의 `index.ts`와 모든 feature import를 함께 확인한다.
4. 저장소/외부 API를 만지는 코드는 깨진 값, 권한 거부, 네이티브 메서드 부재, 빈 결과를 처리한다.
5. shared로 올린 유틸은 도메인 단어를 이름과 타입에서 제거한다.
6. 변경 후 아래 체크 명령어를 실행하고, 실패하면 리팩토링 완료로 보지 않는다.

현재 entity는 두 개다.

- `workout-session`: 운동 세션, 저장된 운동 기록, HealthKit, 캘린더, 운동 리마인더, 운동 장소 알림, 루틴 사이클
- `protein`: 프로틴 상품/가격 데이터, 가격 배지, 상세 모델 조립, 가격 차트, 목록 카드, 프로틴 세일 알림

## 전체 구조

```txt
src/entities
├── protein
│   ├── api      # Supabase 조회
│   ├── lib      # 프로틴 세일 알림 예약/권한/저장소
│   ├── model    # API row를 화면 모델로 바꾸는 adapter, 가격 배지, 타입
│   └── ui       # 프로틴 도메인 카드/차트/disclosure
└── workout-session
    ├── api      # HealthKit
    ├── lib      # 캘린더, 알림, 위치, 루틴 계산, 세션 metric
    └── model    # React context, reducer, 저장소, 타입
```

각 entity의 외부 진입점은 `index.ts`다. feature/app/shared에서 entity 내부 경로(`api/*`, `model/*`, `lib/*`)를 직접 import하지 않는다.

## 경계 판단표

| 코드 성격               | 위치                                   | 예시                                                     |
| ----------------------- | -------------------------------------- | -------------------------------------------------------- |
| 도메인 상태와 상태 전이 | `entities/*/model`                     | 운동 phase, 세트 수, 저장 세션 정규화                    |
| 도메인 외부 side effect | `entities/*/api` 또는 `entities/*/lib` | HealthKit, Supabase 조회, 캘린더 등록, 알림 예약         |
| 도메인 UI 부품          | `entities/*/ui`                        | `ProteinCard`, `PriceTrendChart`                         |
| 화면 흐름과 라우팅      | `features` 또는 `app`                  | 운동 중 화면 복귀, 알림 탭 후 홈 이동                    |
| 화면 전용 UI 상태       | `features/*/ui`                        | drawer 열림, 편집 모드, 탭 선택                          |
| 도메인 없는 순수 유틸   | `shared/lib`                           | JSON parse, URL 검증, 좌표 검증                          |
| 공용 디자인 토큰/hook   | `shared/lib`, `shared/hooks`           | `designTokens`, `useResolvedColorToken`, `useCardColors` |

판단이 애매하면 더 좁은 위치에 둔다. 한 entity에서만 의미가 있으면 `shared`로 올리지 않는다.

## Workout Session

운동 중 상태와 완료된 운동 기록을 다룬다. 앱 전체에서 하나의 `WorkoutProvider`가 현재 운동 상태를 제공하고, 완료된 세션은 AsyncStorage에 저장된다.

처음 볼 파일:

- `model/WorkoutContext.tsx`: 현재 운동 reducer와 도메인 Hook을 조립해 Context API 제공
- `model/useWorkoutActions.ts`: 화면에 노출할 운동 상태 변경 action
- `model/useWorkoutPersistence.ts`: 진행 중 운동 hydration과 snapshot 저장
- `model/useWorkoutCompletion.ts`: 완료 세션 저장과 HealthKit·캘린더·알림 후처리
- `model/useWorkoutLiveActivity.ts`: Live Activity 표시와 외부 명령 동기화
- `model/workoutState.ts`: reducer와 상태 전이
- `model/currentWorkoutStorage.ts`: 진행 중 운동 snapshot 저장소
- `model/workoutPreferenceStorage.ts`: 운동 리마인더·캘린더 자동 추가 선호값 저장소
- `model/storedWorkoutSessionParser.ts`: 과거 저장 포맷 검증과 완료 세션 정규화
- `model/storedWorkoutSessionStorage.ts`: 완료 세션 저장·수정·삭제·기간 조회
- `api/healthKit.ts`: HealthKit 권한, iPhone live workout 시작/복구/종료, 심박/운동 요약 조회
- `lib/workoutHistoryPrefill.ts`: 이전 완료 세션과 현재 운동 구성이 완전히 같을 때 세트 수와 메모 placeholder 계산
- `lib/reminder.ts`: 매일 22시 운동 리마인더
- `lib/workoutPlaceLearning.ts`: 결과 화면에 저장된 운동 위치를 한 세션 표본으로 만들고 30m 기준으로 장소를 병합하는 순수 정책
- `lib/workoutPlaceRebuild.ts`: 기존 완료 세션의 결과 위치로 자동 학습 장소를 재구성하고 누락된 위치 라벨을 보강
- `lib/workoutPlaceArrivalPermissions.ts`: 장소 알림과 foreground/background 위치 권한 확인·요청
- `lib/workoutPlaceArrivalTask.ts`: geofence 진입 시 실제 거리 재검증과 도착 알림을 수행하는 백그라운드 Task
- `lib/workoutPlaceArrivalReminder.ts`: 자동 학습 장소의 geofence lifecycle 동기화와 알림 응답 처리
- `model/workoutPlaceStorage.ts`: 자동 학습 장소 목록과 재학습 제외 세션 저장소
- `model/workoutPlaceReminderStorage.ts`: 장소 알림 활성화·차단·동기화·pending prompt 저장소
- `model/routineCycle.ts`, `model/routineCycleStorage.ts`, `lib/routineCycleProgress.ts`, `lib/routineCycleProgressSnapshot.ts`, `lib/routineCycleState.ts`: 루틴 사이클 설정/진행/상태

공개 API는 `workout-session/index.ts`에서만 export한다. 주요 그룹은 다음과 같다.

- Context: `WorkoutProvider`, `useWorkout`
- HealthKit 세션 제어: `startWorkoutSession`, `pauseWorkoutSession`, `resumeWorkoutSession`, `endWorkoutSession`, `readLiveWorkoutStats`
- 저장 세션/HealthKit 조회 조합: `getWorkoutSessionDetailData`, `getWorkoutSessionSummaryDataForDate`, `getWorkoutSessionSummaryDataForMonth`, `getWorkoutSummariesForSessions`, `getWorkoutSessionKcalFromSummaries`, `getWorkoutSessionDetailActiveKcal`
- 위치/캘린더: `getWorkoutLocationOnce`, `registerWorkoutToCalendar`, `updateWorkoutCalendarEvent`, `deleteWorkoutCalendarEvent`
- 운동 리마인더: `getWorkoutReminderEnabled`, `setWorkoutReminderEnabled`, `syncWorkoutReminderAtNight`, `cancelScheduledWorkoutReminder`
- 장소 도착 알림: 자동 학습 장소 목록/삭제, `rebuildAndSyncWorkoutPlaceArrivalReminder`, `disableWorkoutPlaceArrivalReminder`, `registerWorkoutPlaceNotificationHandler`, pending prompt
- 완료 세션 저장소: `getStoredWorkoutSession`, `getStoredWorkoutSessionsInRange`, `getStoredWorkoutSessionsForMonth`, `getAllStoredWorkoutSessions`, `getLatestStoredWorkoutSession`, `updateStoredWorkoutMemo`, `updateStoredWorkoutSetCounts`, `deleteStoredWorkoutSession`
- 세션 표시 유틸: `getWorkoutBodyPartSetLabel`, `getWorkoutBodyPartSetKey`, `getWorkoutBodyPartDetails`, `getUniqueWorkoutBodyParts`, duration/set count metric
- 이전 기록 프리필: `buildWorkoutHistoryPrefill`, `buildRoutinePartHistoryPrefill`
- 세션 표시 UI: `BodyPartIcon`, `BodyPartIconHost`
- 루틴 사이클: 기본 설정, normalize/resize, 저장소 load/save, progress/cycle 계산
- 타입: `BodyPart`, `WorkoutBodyPartSet`, `StoredWorkoutSession`, `WorkoutState`, 루틴 사이클 타입들

진행 중 운동 복구 계약:

- `WorkoutContext`는 저장소 hydration 후 복구 가능한 상태(`countdown`, `recording`, `paused`)를 진행 중 스냅샷으로 저장한다.
- `phase`, `sessionId`, `startedAt`, `pausedAt`, `pausedDuration`, `bodyParts`, `cardioStartedAt`, `location`처럼 복구에 필요한 필드는 변경 시 즉시 저장한다.
- `memo`는 입력 중 저장 빈도를 줄이기 위해 `useDebouncedEffect`로 1초 디바운스 저장한다.
- `idle` 또는 `completed` 상태는 복구 대상이 아니므로 진행 중 스냅샷을 삭제한다.
- live metric 변화만으로는 진행 중 스냅샷 저장을 새로 트리거하지 않는다.

HealthKit live metric 계약:

- 저장된 진행 중 운동의 `startedAt`이 있는 상태에서 `startWorkoutSession(true)`가 호출되면 iOS 26 이상에서 새 iPhone live workout session 시작 전에 네이티브 활성 세션 복구를 먼저 시도한다.
- 복구 실패 또는 활성 세션 없음은 운동 흐름을 막지 않고 기존 시작 흐름이나 HealthKit 샘플 polling fallback으로 이어진다.
- reducer는 심박수 `null`로 기존 심박수를 지우지 않고, 활동/총 칼로리는 이전 값보다 작은 값을 반영하지 않는다.
- native live metric 값이 부족하면 HealthKit 샘플 fallback 값을 병합해 표시 지표를 보강한다.

완료 세션 세트 수/캘린더 연결 계약:

- `StoredWorkoutSession.calendarEventId`는 nullable이며, 필드가 없거나 잘못된 기존 저장값은 `null`로 정규화한다.
- 세트 수 수정은 기존 운동 항목의 `setCount`만 바꾼다. 운동 부위/세부 부위의 추가, 삭제, 변경, 순서 변경과 HealthKit, 시간, 메모, 위치 수정은 허용하지 않는다.
- 신규 OS 캘린더 이벤트 생성에 성공하면 반환된 이벤트 ID를 해당 완료 세션의 `calendarEventId`로 저장한다.
- 세트 수 저장 후 연결된 동일 이벤트의 제목과 메모를 현재 세션 값으로 갱신하고 시간과 위치는 유지한다.
- `calendarEventId`가 `null`인 과거 세션은 YepBuddy 캘린더에서 기존 제목, 시작 시각, 종료 시각이 모두 일치하는 후보가 정확히 1건일 때만 연결한다.
- 운동 기록 삭제 시 연결된 OS 이벤트를 먼저 삭제한다. 이벤트가 이미 없으면 삭제 완료로 간주하고, 권한/기타 오류나 연결 실패는 feature가 사용자에게 `앱 기록만 삭제` 선택을 요청할 수 있도록 구분한다.
- 캘린더 자동 저장 선호값은 신규 이벤트 생성만 제어하고, 이미 연결된 이벤트의 수정과 삭제는 막지 않는다.

Feature 사용처:

- `app/_layout.tsx`: `WorkoutProvider`, 앱 시작 시 운동 리마인더/장소 리마인더 sync, 장소 알림 handler 등록
- `features/do-workout`: `useWorkout`, 이전 운동 기록 기반 세트 수/메모 placeholder 프리필, HealthKit 세션 제어, timer 타입, body part selector/list, 루틴 추천, 캘린더 등록, 완료 후 리마인더 sync
- `features/start-workout`: 운동 시작 countdown에서 현재 위치를 한 번 가져오고 기존 운동 리마인더를 취소
- `features/view-result`: 저장 세션/HealthKit 상세 조회, 메모/세트 수 수정, 연결된 캘린더 이벤트 갱신, 캘린더 이벤트와 세션 삭제, 삭제 후 장소 리마인더 재빌드
- `features/view-sessions`: 월별 저장 세션과 HealthKit 요약 조회
- `features/view-calendar`: 날짜 범위별 저장 세션 조회
- `features/view-summary`: 오늘/이번 주/최근 세션, 루틴 사이클 진행률과 사이클, 장소 알림 pending prompt 처리
- `features/manage-settings`: 운동 리마인더, 운동 장소 알림, 루틴 사이클 설정 UI
- `entities/workout-session/ui/BodyPartIcon`: 운동 부위 아이콘 표시

### 왜 일부 코드가 feature/app으로 이동했나

현재 구조에서 `entities`가 `features`로 대체된 것은 아니다. 운동 세션 상태, 저장소, HealthKit, 캘린더, 알림, 장소 리마인더, 루틴 사이클 규칙은 그대로 `workout-session` entity가 가진다.

이동한 것은 route를 직접 아는 orchestration 코드다.

- 운동 중 다른 화면에 들어가면 `/workout/active`로 돌려보내는 가드
- 운동 장소 알림을 탭한 뒤 화면 이동시키는 처리

이 둘은 운동 세션 도메인 규칙이 아니라 앱 화면 흐름이다. entity 안에 있으면 `workout-session`이 Expo Router 경로 문자열과 화면 정책을 알아야 하고, 같은 운동 상태를 다른 화면 흐름에서 재사용하기 어려워진다. 그래서 entity는 “운동이 복구 가능한 상태인지”, “장소 알림 pending prompt를 저장했는지” 같은 도메인 상태만 제공하고, 실제 화면 이동은 `features`와 `app`에서 한다.

현재 책임 분리는 다음과 같다.

- `entities/workout-session`: 운동 상태와 저장 데이터, 외부 API side effect를 관리한다.
- `features/do-workout/ui/WorkoutNavigationGuard.tsx`: 현재 route를 보고 운동 화면으로 복귀시킨다.
- `app/_layout.tsx`: 운동 장소 알림 handler에 화면 이동 콜백을 넘긴다.

따라서 feature가 entity를 대체한 것이 아니라, entity가 알면 안 되는 route 책임만 feature/app으로 내려간 것이다.

## Protein

프로틴 상품과 가격 데이터를 Supabase에서 가져와 리스트/상세 화면 모델로 바꾼다. 로컬 저장소는 쓰지 않는다.

처음 볼 파일:

- `api/proteinApi.ts`: Supabase 테이블/RPC 조회, id/숫자/URL/boolean 입력 정규화
- `api/supabaseClient.ts`: env 또는 Expo config에서 Supabase 설정을 읽고 client를 재사용
- `model/adapters.ts`: API row와 가격 row를 `Protein`, `ProteinDetail`로 조립
- `model/badge.ts`: 가격 분위수 기준 배지 판정
- `ui/ProteinCard.tsx`, `ui/PriceTrendChart.tsx`, `ui/CoupangPartnersDisclosure.tsx`: 프로틴 도메인 UI

공개 API는 `protein/index.ts`에서만 export한다.

- API: `fetchProteins`, `fetchProtein`, `fetchLatestProteinPrices`, `fetchProteinPrices`, `fetchProteinFlavors`
- Adapter: `mergeProteinListItems`, `buildProteinDetail`, `getProteinCategoryLabel`
- UI: `ProteinCard`, `PriceTrendChart`, `CoupangPartnersDisclosure`
- 타입: `Protein`, `ProteinDetail`, `ProteinCategory`, API row/price/history 타입

Feature 사용처:

- `features/view-proteins`: 상품 목록과 최신 가격을 조회하고 `mergeProteinListItems`로 리스트 모델 생성, `ProteinCard`와 disclosure 렌더링
- `features/view-protein-detail`: 단건 상품, 가격 히스토리, 맛 정보를 조회하고 `buildProteinDetail`로 상세 모델 생성, `PriceTrendChart`와 disclosure 렌더링

구매 링크 열기는 `features/view-protein-detail`에서 `shared/lib/legalLinks`의 `getSafeWebUrl`, `openWebUrl`로 처리한다. `protein` entity 내부에서는 React Native의 URL 열기 API를 직접 호출하지 않는다.

## Shared API 사용

Workout session이 사용하는 shared API:

- `shared/hooks/useDebouncedEffect`: 현재 운동 메모 스냅샷 저장 debounce
- `shared/lib/date`: 로컬 날짜 키, 주차 계산, ISO 시간 계산
- `shared/i18n/i18n`: 캘린더/알림 문구

Protein이 사용하는 shared API:

- `shared/hooks/useCardColors`: SwiftUI 기반 카드/차트 색상 토큰
- `shared/hooks/useResolvedColorToken`, `shared/lib/designTokens`: NativeWind/CSS 변수와 primitive fallback 색상 해석
- `shared/ui/Card`, `shared/ui/GlassSurface`: 프로틴 카드와 차트 표면
- `shared/lib/skiaChartPaths`: 가격 차트 path 생성

`shared`에는 화면 흐름이나 특정 도메인 저장소 규칙을 올리지 않는다. 예를 들어 `sessionMetrics`와 `bodyPartSet`은 순수 함수지만 운동 도메인 의미가 강하므로 `workout-session`에 둔다.

## 외부 API

Workout session:

- `@react-native-async-storage/async-storage`: 운동 세션, 루틴, 리마인더 설정 저장
- `react-native-health`: HealthKit 권한, workout 저장, heart rate/workout sample 조회
- `expo-calendar`: 캘린더 권한, YepBuddy 캘린더 생성, 운동 이벤트 생성/조회/수정/삭제
- `expo-location`: 현재 위치, reverse geocode, foreground/background location 권한, geofence
- `expo-notifications`: 리마인더 예약/취소, Android notification channel, 알림 응답 listener
- `expo-task-manager`: 장소 도착 geofence background task 등록
- `react-native` `Alert`, `Linking.openSettings`: 캘린더 권한이 없을 때 설정 이동 안내

Protein:

- `@supabase/supabase-js`: 상품/가격/맛 데이터 조회
- `expo-constants`: Supabase config fallback
- `victory-native`, `@shopify/react-native-skia`: 가격 차트 렌더링
- `@expo/ui/swift-ui`: 프로틴 카드의 SwiftUI 텍스트/레이아웃

## 저장소 Key와 데이터

Workout session AsyncStorage:

- `yb:healthkit:access`: `"enabled"` 또는 `"denied"`. HealthKit을 사용자가 명시적으로 허용했는지 캐시한다.
- `yb:workout:current`: 진행 중 운동의 `WorkoutState` JSON. 앱 재시작 후 복구용이다.
- `yb:workout:session:${sessionId}`: 완료된 `StoredWorkoutSession` JSON. nullable `calendarEventId`로 생성된 OS 캘린더 이벤트를 연결한다.
- `yb:workout:sessions`: 과거 완료 세션 ID 인덱스. 현재 코드는 실제 `yb:workout:session:*` 키를 직접 스캔하며 이 legacy 값은 읽거나 갱신하지 않는다.
- `yb:workout:date:${YYYY-MM-DD}`: 해당 날짜 대표 `sessionId`.
- `yb:workout:dates`: 과거 날짜 키 인덱스. 현재 조회에는 필요하지 않아 legacy 값은 읽거나 갱신하지 않는다.
- `yb:workout:reminder`: 예약된 운동 리마인더 notification identifier.
- `yb:workout:reminder:enabled`: `"true"` 또는 `"false"`.
- `yb:workout:weekly-routine`: `RoutineCycleSettings` JSON. 같은 날짜에 새 사이클을 시작한 경우 이전 세션을 제외하기 위한 `cycleStartedAtIso`를 포함할 수 있다.
- `yb:workout:weekly-routine-feature-status`: `"unasked"`, `"enabled"`, `"disabled"`.
- `yb:workout:weekly-routine-prompt`: `RoutineCyclePromptState` JSON. 사이클 종료 Alert를 dismiss한 앵커 날짜 키를 저장한다.
- `yb:workout-place-reminder:enabled`: `"true"` 또는 `"false"`.
- `yb:workout-place-reminder:places`: 자동 학습 장소 최대 20개의 좌표, 주소 라벨과 포맷 버전, 방문 시각/횟수, source session ID 배열 JSON. 이전 포맷 라벨은 현재 버전으로 다시 생성한다.
- `yb:workout-place-reminder:cooldown-started-at`: 운동 완료 또는 알림 성공 중 가장 최근 시각. key는 호환성을 유지하고 현재 정책은 로컬 날짜 단위 당일 차단이다.
- `yb:workout-place-reminder:pending-prompt`: `PendingWorkoutPlaceReminderPrompt` JSON. 장소 도착 알림을 탭한 뒤 요약 화면에서 운동 시작 확인을 띄우기 위한 값이다.
- `yb:workout-place-reminder:sync-status`: geofence 동작 가능 여부와 실패 이유 JSON.
- `yb:workout-place-reminder:excluded-session-ids`: 사용자가 삭제한 장소가 과거 결과 재구성으로 즉시 복원되지 않게 제외할 source session ID 배열 JSON.

Protein은 로컬 저장소를 쓰지 않는다. Supabase에서는 다음을 사용한다.

- table `proteins`
- table `protein_flavors`
- RPC `get_latest_protein_prices`
- RPC `get_protein_price_history`

## 주요 Side Effect

- `WorkoutProvider`는 앱 시작 시 진행 중 운동 스냅샷을 읽고, 운동 상태가 바뀌면 debounce로 저장한다.
- `completeWorkout`은 완료 세션 저장, 결과 위치 기반 장소 학습, 장소 알림의 당일 차단 시각 갱신, geofence 동기화, 진행 중 스냅샷 삭제를 수행한다.
- `startWorkoutSession`은 사용자 운동 시작 흐름에서만 HealthKit 권한/초기화를 요청한다.
- HealthKit 조회 함수는 권한 캐시가 `"enabled"`일 때만 조용히 시도한다.
- `getWorkoutLocationOnce`는 foreground location 권한을 요청하고 현재 위치를 한 번 읽는다.
- `registerWorkoutToCalendar`는 캘린더 권한 요청, YepBuddy 캘린더 생성, 이벤트 생성을 수행하고, 생성 이벤트 ID를 해당 완료 세션에 연결한다. 권한 거부 시 설정 안내 Alert를 수행한다.
- 캘린더 이벤트 갱신은 저장된 `calendarEventId` 또는 과거 세션의 유일 일치 후보를 대상으로 제목과 메모를 수정한다.
- 캘린더 이벤트 삭제는 앱 기록 삭제보다 먼저 실행되며, 이미 없는 이벤트와 권한/기타 실패를 구분해 feature에 전달한다.
- `syncWorkoutReminderAtNight`은 권한 상태와 enabled 저장값에 맞춰 매일 22시 리마인더를 예약/취소한다.
- `syncWorkoutPlaceArrivalReminder`는 알림/location 권한과 자동 학습된 최근 장소 최대 20개에 맞춰 50m Enter geofence를 등록/중지하고 동기화 상태를 저장한다.
- `registerWorkoutPlaceNotificationHandler`는 장소 알림 탭을 pending prompt 저장 또는 active workout 복귀 콜백으로 바꾸고, 화면 이동은 app에서 받은 콜백에 맡긴다.
- geofence `TaskManager.defineTask`는 Enter 이벤트에서 현재 위치를 한 번 조회한다. 정확도와 20m 거리, 운동 상태, 로컬 날짜 당일 제한을 통과하면 알림을 예약한다.
- `fetch*Protein*` 함수는 Supabase network 요청을 수행하고 실패 시 `Error`를 throw한다.

## 에러 처리 기준

- 저장소의 JSON은 깨질 수 있으므로 `JSON.parse`는 작은 helper 안에서만 잡고 `null`, `[]`, 기본 상태로 돌린다.
- 저장된 운동 세션은 읽을 때 날짜, body part, set count, 좌표를 최소 정규화한다. 잘못된 세션은 조회 결과에서 제외한다.
- HealthKit, location, calendar, notification, geofence, Supabase처럼 외부 세계와 만나는 함수에서만 실패를 명확한 반환값으로 바꾼다.
- `false`: 요청한 외부 side effect를 수행하지 못했거나 권한이 없을 때. 캘린더 삭제처럼 이미 존재하지 않는 상태와 실제 실패를 구분해야 하는 작업은 별도 결과로 표현한다.
- `null`: 단건 데이터가 없거나 입력이 잘못됐을 때.
- `[]`: 목록 조회가 불가능하거나 결과가 없을 때.
- Supabase 조회 실패는 feature가 에러 UI를 낼 수 있도록 throw한다.
- 앱 시작 sync, 완료 후 장소 리마인더 sync처럼 조용히 실패해도 주 흐름을 막지 않는 side effect는 caller에서 `catch(() => undefined)`를 허용한다.

## try/catch 사용 기준

- `try/catch`는 `JSON.parse`, `Location.getCurrentPositionAsync`, `Location.reverseGeocodeAsync`, `Calendar.createEventAsync`, URL 열기 API 같은 외부 실패를 한 문장으로 설명할 수 있을 때만 쓴다.
- 함수 전체를 넓게 감싸지 않는다. 실패 가능한 호출 주변만 작게 감싼다.
- 타입 체크나 날짜/숫자 검증으로 막을 수 있는 문제는 `try/catch` 대신 조건문으로 처리한다.
- catch에서 조용히 삼키는 경우는 해당 side effect가 없어도 사용자의 핵심 흐름이 계속될 때만 허용한다.
- 실패 후 반환값은 `false`, `null`, `[]`, 기본 상태 중 하나로 명확해야 한다.

## 중복 로직 정리 기준

- 같은 entity 내부에서만 반복되면 해당 entity의 `model` 또는 `lib`에 둔다.
- 저장소 key, 외부 API row 변환, 운동/프로틴 도메인 규칙은 entity에 둔다.
- 도메인과 무관하고 세 번째 사용처가 예상되는 순수 유틸만 `shared`로 올린다.
- `shared`에는 route, 화면명, 운동/프로틴 저장 형식 같은 도메인 지식을 넣지 않는다.
- 두 곳에서 반복된다는 이유만으로 shared로 올리지 않는다. 공통화 후 코드가 읽기 어려워지면 중복을 유지한다.

## 하드코딩 값 처리 기준

- storage key, notification kind/channel/task name, Supabase table/RPC 이름은 의미 있는 상수로 둔다.
- 장소 병합/geofence/실제 도착 반경, 위치 정확도, 당일 제한, 운동 리마인더 시간처럼 도메인 정책인 값은 entity 내부 상수로 둔다.
- route 문자열은 entity에 두지 않는다. 현재 route 이동은 `app` 또는 `features`에서 처리한다.
- 색상 hex가 entity UI에 필요하면 먼저 `shared` token/hook으로 표현 가능한지 본다. iOS calendar color처럼 외부 API가 실제 hex를 요구하는 단일 값은 상수로 유지한다.
- `primitive.json`은 `shared/lib/designTokens`에서만 직접 읽고, entity/ui에서는 semantic token이나 hook을 통해 사용한다.
- 한 번만 쓰이고 의미가 분명한 숫자/문구는 억지로 추상화하지 않는다.
- 사용자에게 보이는 문구는 i18n으로 관리한다.

## 금지 패턴

아래 패턴이 새로 생기면 리팩토링이 잘못된 것이다.

- `features`/`app`/`shared`에서 `@/entities/*/api`, `@/entities/*/model`, `@/entities/*/lib`, `@/entities/*/ui`를 직접 import
- `entities`에서 `expo-router`, route path 문자열, navigation guard 구현
- `protein` entity에서 `Linking.openURL` 같은 직접 URL 열기 side effect
- `protein` entity에서 AsyncStorage 사용
- `shared`에 `Workout`, `Protein`, `Session`, `Routine` 같은 도메인 타입/저장 규칙 추가
- UI 파일에서 `@/tokens/primitive.json` 직접 import
- `useUnstableNativeVariable`을 `shared/hooks/useResolvedColorToken` 밖에서 직접 호출
- 저장소 읽기 코드에서 `JSON.parse`를 직접 호출
- 실패 가능한 외부 API 호출을 함수 전체 `try/catch`로 넓게 감싸기
- 기존 저장소 key나 notification identifier를 migration 없이 변경

## 완료 조건

리팩토링 완료라고 말하려면 아래 조건을 모두 만족해야 한다.

- 변경 이유가 `에이전트 리팩토링 계약`의 분류 중 하나로 설명된다.
- public API가 유지되거나, 바뀐 경우 모든 import/use site가 함께 수정됐다.
- 저장소/외부 API 입력값은 깨진 값과 빈 결과를 처리한다.
- route 책임은 `app` 또는 `features`에 있고 entity에는 없다.
- hardcoded 색상이나 primitive token 직접 접근이 entity/ui에 남아 있지 않다.
- `git diff --check`, TypeScript, lint가 통과한다.
- 의도한 변경과 무관한 파일은 같은 커밋에 넣지 않는다.

## 수정 전 체크 명령어

entities를 수정하기 전후에는 아래를 확인한다.

```bash
bunx tsc --noEmit --pretty false
bun run lint
git diff --check
rg -n "#[0-9A-Fa-f]{3,8}" src/entities
rg -n "px-\\[|py-\\[|pt-\\[|pb-\\[|pl-\\[|pr-\\[|m-\\[|w-\\[|h-\\[|min-h-\\[|max-w-\\[" src/entities
rg -n 'Linking[.]openURL|router[.](push|replace)|AsyncStorage[.]|Notifications[.]' src/entities
rg -n '@/entities/[^"]+/(api|model|lib|ui)' src/app src/features src/shared
rg -n 'primitive[.]json|useUnstableNativeVariable' src/entities src/features src/shared
```
