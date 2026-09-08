# Features Guide

`src/features`는 Expo Router 화면에서 바로 조합되는 사용자 흐름을 둔다. 도메인 데이터, 저장소, HealthKit, 알림, Supabase 조회 같은 규칙은 `entities`가 맡고, 화면 공용 UI와 순수 유틸은 `shared`를 사용한다.

Feature에서는 route 진입, 화면 전용 상태, 사용자 액션 orchestration, loading/error/empty UI를 관리한다. 화면 흐름을 위해 route 문자열을 쓰는 것은 feature/app 책임이지만, route 지식이 `entities`로 올라가면 안 된다.

## 전체 구조

```txt
features/
├── view-summary          # 홈/일지 탭, 요약 카드와 루틴 사이클 prompt
├── start-workout         # 운동 시작 countdown
├── do-workout            # 운동 중 화면, drawer, HealthKit/timer orchestration
├── view-result           # 운동 결과 상세, 메모/세트 수 수정, 캘린더 연동 삭제
├── view-sessions         # 운동 세션 목록
├── view-calendar         # 운동 캘린더
├── view-proteins         # 프로틴 목록
├── view-protein-detail   # 프로틴 상세
├── manage-settings       # 설정 화면과 알림/루틴 토글
└── use-tempo             # 템포 타이머
```

각 feature의 외부 진입점은 해당 폴더의 `index.ts`다. 앱 route는 가능하면 feature 내부 파일이 아니라 `@/features/<feature>`에서 화면 컴포넌트를 import한다. feature 내부에서는 같은 feature의 `model`, `lib`, `ui`를 상대 경로로 import한다.

## Route Map

| Route                | Feature               | 렌더링                                              |
| -------------------- | --------------------- | --------------------------------------------------- |
| `/(tabs)/index`      | `view-summary`        | `SummaryScreen` + app route의 `SettingsFab`         |
| `/(tabs)/protein`    | `view-proteins`       | `ProteinListScreen` + app route의 `SettingsFab`     |
| `/(tabs)/tempo`      | `use-tempo`           | `TempoScreen`, `fromWorkout=1`이면 back button 표시 |
| `/workout/countdown` | `start-workout`       | `CountdownScreen`                                   |
| `/workout/active`    | `do-workout`          | `ActiveWorkoutScreen`                               |
| `/workout/[id]`      | `view-result`         | `ResultScreen`                                      |
| `/sessions`          | `view-sessions`       | `WorkoutNavigationGuard` + `SessionListScreen`      |
| `/calendar`          | `view-calendar`       | `WorkoutNavigationGuard` + `CalendarScreen`         |
| `/protein/[id]`      | `view-protein-detail` | `WorkoutNavigationGuard` + `ProteinDetailScreen`    |
| `/settings`          | `manage-settings`     | `SettingsScreen`                                    |

`WorkoutNavigationGuard`는 `do-workout`에 있지만 여러 route에서 함께 mounted 된다. 진행 중이거나 일시정지된 운동이 있고 현재 route가 허용 목록이 아니면 `/workout/active`로 돌려보낸다.

## Feature별 역할

### `view-summary`

홈 일지 화면이다. `app/(tabs)/index.tsx`에서 `SummaryScreen`으로 진입한다.

주요 흐름:

- `SummaryScreen`이 카드 레이아웃, 편집 상태, 데이터 hook, 루틴 사이클 안내 Alert를 조합한다.
- `useSummaryCardLayout`이 카드 순서/숨김 상태를 `AsyncStorage`에 저장한다.
- `SummaryCardRows` → `EditableSummaryCardFrame` → `SummaryCardRenderer` 순서로 카드가 렌더링된다.
- `SummaryCardRenderer`는 오늘 운동, 운동 시간, 세트 수, 최근 세션, 운동 시작, 분할 루틴 카드를 분기한다.
- 장소 도착 알림 pending prompt가 있으면 요약 화면 focus 시 확인 Alert를 띄우고 `/workout/countdown` 또는 `/workout/active`로 보낸다.
- 루틴 사이클 첫 안내는 `useRoutineCycleFeaturePrompt`가 `/settings?routineSetup=1`로 연결한다.
- 루틴 사이클 종료 안내는 `RoutineCycleSetupPromptAlert`가 native Alert로 표시하며, `루틴 변경`, `그대로 시작`, `나중에` 선택을 처리한다.

주요 컴포넌트:

- `SummaryScreen`
- `SummaryCardRows`
- `EditableSummaryCardFrame`
- `SummaryCardRenderer`
- `SummaryHiddenCardPicker`
- `SummaryEditControls`
- `TodayWorkoutCard`
- `WorkoutLinkCard`
- `SessionLinkCard`
- `RoutineCycleSessionList`
- `RoutineCycleSetupPromptAlert`

사용하는 `entities/workout-session` API:

- `useWorkout`
- `getPendingWorkoutPlaceReminderPrompt`, `clearPendingWorkoutPlaceReminderPrompt`
- `getWorkoutSessionSummaryDataForDate`, `getWorkoutSummariesForSessions`
- `getWorkoutSessionKcalFromSummaries`
- `getStoredWorkoutSessionIdByDate`, `getLatestStoredWorkoutSession`
- `getStoredWorkoutSessionsInRange`, `getStoredWorkoutSessionDurationMinutes`
- `getWorkoutBodyPartSetLabel`
- routine cycle load/save/progress/cycle/prompt API

사용하는 shared API:

- `Main`, `Card`, `StatCard`, `BodyPartIconHost`, `IconButton`, `GlassCircleBackground`
- `formatDateWithDay`, `bodyPartLabel`, `bodyPartDetailLabel`
- `getThisWeekDateRange`, `getLocalDateKey`, `getLocalDateKeyFromIso`
- `parseJsonOrNull`
- `openWebUrl`, `privacyPolicyUrl`, `supportUrl`
- `useNotificationPermissionRequestDone`

주요 side effect:

- summary card layout `AsyncStorage` read/write
- AppState active/자정 기준 summary refresh
- routine cycle setting/status/prompt storage load/save
- pending workout place reminder prompt clear
- legal link open

### `start-workout`

운동 시작 전 countdown 화면이다. `app/workout/countdown.tsx`에서 `CountdownScreen`으로 진입한다.

주요 흐름:

- `CountdownScreen`이 `startCountdown()`을 호출한다.
- 예약된 운동 리마인더를 취소한다.
- 현재 위치를 한 번 조회해서 workout state에 저장한다. 실패하면 `null`로 둔다.
- `useCountdown` 완료 시 `startRecording()` 후 `/workout/active`로 replace한다.

주요 컴포넌트:

- `CountdownScreen`

사용하는 `entities/workout-session` API:

- `useWorkout`
- `cancelScheduledWorkoutReminder`
- `getWorkoutLocationOnce`

사용하는 shared API:

- `Main`, `IconBox`
- `useResolvedColorToken`, `semanticColorTokens`

주요 side effect:

- reminder cancel
- location permission/current position request
- route replace to active workout

### `do-workout`

운동 중 화면과 운동 상태 전환을 조합한다. `app/workout/active.tsx`에서 `ActiveWorkoutScreen`으로 진입하고, guard는 app route 여러 곳에서 사용된다.

주요 흐름:

- `ActiveWorkoutScreen`은 hydration 전이나 `idle/countdown` phase에서 실제 운동 UI를 렌더링하지 않고 올바른 route로 보낸다.
- `useWorkoutTimer`가 기록 중일 때만 timer를 갱신하고, pause 상태에서는 표시를 고정한다.
- `useHealthKitWorkout`이 recording 상태에서 HealthKit live workout 시작 또는 기존 활성 세션 복구를 시도하고 live stats 이벤트/폴링 동기화를 맡는다.
- 저장된 진행 중 운동의 `startedAt`이 있는 복구 흐름에서는 iOS 26 이상에서 새 iPhone live workout session 시작 전에 네이티브 활성 세션 복구를 먼저 시도한다.
- native live stats 이벤트가 없거나 센서 대기/오류 상태가 이어지면 HealthKit 샘플 polling fallback으로 지표를 보강한다.
- `BodyPartSelector`, `RoutineSessionPicker`, `SetCountList`, `MemoSection`이 운동 입력 UI를 구성한다.
- `useWorkoutHistoryPrefill`이 완료된 운동 기록을 읽고, 현재 선택한 운동 구성이 과거 세션과 완전히 같을 때만 이전 세트 수를 자동 적용한다.
- 이전 메모는 실제 입력값으로 저장하지 않고 `MemoSection` placeholder로만 보여준다.
- `WorkoutDrawer`가 cardio 시작, tempo 진입, pause/resume, 완료, 폐기 액션을 제공한다.
- 완료 시 `completeWorkout()` 후 HealthKit 종료, 운동 리마인더 sync, 캘린더 등록 확인 Alert, 결과 화면 이동을 처리한다.

주요 컴포넌트:

- `ActiveWorkoutScreen`
- `WorkoutNavigationGuard`
- `WorkoutDrawer`
- `StatsSection`
- `RoutineSessionPicker`
- `BodyPartSelector`
- `SetCountList`
- `MemoSection`
- `useWorkoutHistoryPrefill`

사용하는 `entities/workout-session` API:

- `useWorkout`
- `buildWorkoutHistoryPrefill`, `buildRoutinePartHistoryPrefill`
- `getAllStoredWorkoutSessions`
- `startWorkoutSession`, `pauseWorkoutSession`, `resumeWorkoutSession`, `endWorkoutSession`
- `readLiveWorkoutStats`
- `registerWorkoutToCalendar`
- `syncWorkoutReminderAtNight`
- routine cycle load/progress/suggestion API
- body part set helpers and types

사용하는 shared API:

- `Main`, `Chip`, `GlassSurface`, `GlassTextarea`, `Stepper`
- `formatElapsedMs`, `bodyPartLabel`, `bodyPartDetailLabel`
- `getThisWeekDateRange`
- `useResolvedColorToken`, `semanticColorTokens`

주요 side effect:

- HealthKit workout session start/pause/resume/end
- live HealthKit polling interval
- current workout state updates through `useWorkout`
- calendar registration prompt/action
- workout reminder sync after completion
- discard confirmation and route replace
- route push to `/(tabs)/tempo?fromWorkout=1`

### `view-result`

운동 결과 상세 화면이다. `app/workout/[id].tsx`가 route param을 decode해서 `ResultScreen`에 넘긴다.

주요 흐름:

- `useSessionDetail`이 저장된 세션과 HealthKit 상세를 함께 조회한다.
- 저장 세션이 없으면 no data 상태를 보여준다.
- 메모는 `GlassTextarea`에서 debounce로 `updateStoredWorkoutMemo`에 저장한다.
- 상단 휴지통 옆의 연필 아이콘은 현재 메모 저장을 시작하고 세트 수 수정 바텀시트를 연다.
- 바텀시트는 리퀴드 글래스 배경에서 현재 저장된 운동 부위/세부 부위를 읽기 전용으로 표시하고 기존 `Stepper`의 glass variant로 항목별 `setCount`만 최소 1까지 수정한다.
- Stepper 변경은 draft에만 반영하며 `취소`는 버리고 `저장`은 완료 세션의 세트 수와 연결된 OS 이벤트 제목·메모를 갱신한다.
- 상단 헤더 오른쪽의 휴지통 아이콘은 삭제 확인 흐름을 연다. 연결된 OS 이벤트를 먼저 삭제한 뒤 저장 세션 삭제, 장소 리마인더 후보 재빌드, 장소 리마인더 sync, 홈 이동 순서로 처리한다.
- OS 이벤트가 이미 없으면 로컬 삭제를 계속하고, 연결 실패나 권한/기타 오류가 있으면 사용자가 `앱 기록만 삭제`를 명시적으로 선택한 경우에만 계속한다.
- iOS에서 선택된 HealthKit workout의 유효 심박 샘플이 2개 이상이면 `HeartRateChart`, 위치가 있으면 `LocationMap`을 렌더링한다. 조회 실패에도 로컬 세션과 수정·삭제 기능을 유지한다.
- 결과 평균은 차트와 같은 유효 심박 샘플을 우선 사용하며, 샘플이 없을 때만 저장 평균·HealthKit 평균으로 보강한다.
- `HeartRateChart`는 workout 시작~종료 시각으로 실제 시간 비율 point를 만들고, X를 `HH:mm:ss`로 바꾸는 formatter와 ko/en 라벨·BPM formatter를 `shared/ui/MetricChart`에 전달한다. 차트 통계·스타일·렌더링·점 선택·접근성 탐색은 공용 컴포넌트가 소유한다.

편집 경계:

- 결과 화면의 기본 조회 UI는 유지하고 편집 컨트롤은 바텀시트 안에서만 표시한다.
- 연필과 휴지통 액션은 아이콘으로만 표시하며 접근성 라벨을 제공한다.
- 세트 편집으로 운동 부위/세부 부위를 추가, 삭제, 변경하거나 순서를 바꾸지 않는다.
- HealthKit 데이터, 운동 시작/종료 시각, 위치는 세트 저장의 변경 대상이 아니다. 현재 메모는 연필 아이콘을 누를 때 별도 저장한다.
- 캘린더 자동 저장 선호값은 신규 생성만 제어하므로 이미 연결된 이벤트의 수정과 삭제를 건너뛰는 조건으로 사용하지 않는다.

주요 컴포넌트:

- `ResultScreen`
- `SessionHeader`
- `StatsGrid`
- `HeartRateChart`
- `LocationMap`

사용하는 `entities/workout-session` API:

- `getWorkoutSessionDetailData`
- `getWorkoutSessionDetailActiveKcal`
- `updateStoredWorkoutMemo`
- `updateStoredWorkoutSetCounts`
- `updateWorkoutCalendarEvent`
- `deleteWorkoutCalendarEvent`
- `deleteStoredWorkoutSession`
- `rebuildAndSyncWorkoutPlaceArrivalReminder`
- `getStoredWorkoutSessionDurationSeconds`
- body part label helpers

사용하는 shared API:

- `Main`, `GlassTextarea`, `IconButton`, `Stepper`, `Card`, `StatCard`, `GlassSurface`, `BodyPartIconHost`
- `useCardColors`
- `formatDateWithDay`, `formatDuration`, `formatTime`, `bodyPartLabel`, `bodyPartDetailLabel`
- `MetricChart`

주요 side effect:

- stored session and HealthKit detail reads
- memo save debounce
- set count draft/save and linked calendar title update
- delete confirmation, linked calendar event deletion, explicit local-only fallback and stored session deletion
- workout place reminder rebuild/sync
- route back/replace

### `view-sessions`

세션 목록 화면이다. `/sessions`에서 `WorkoutNavigationGuard`와 함께 `SessionListScreen`이 렌더링된다.

주요 흐름:

- `useInfiniteSessions`가 현재 월부터 과거 월을 순차 로드하고, 스크롤 하단 접근 시 이전 월을 추가 로드한다.
- AppState active와 자정 경계에서 refresh key를 올려 목록을 다시 계산한다.
- `FilterTabs`가 body part filter를 관리하고 `filterSessions`로 목록을 거른다.
- `groupByMonth` 결과를 month header와 `SessionCard` 목록으로 렌더링한다.
- 세션 press 시 `/workout/[id]`로 이동한다.

주요 컴포넌트:

- `SessionListScreen`
- `FilterTabs`
- `SessionCard`

사용하는 `entities/workout-session` API:

- `getWorkoutSessionSummaryDataForMonth`
- `getWorkoutSessionKcalFromSummaries`
- `getUniqueWorkoutBodyParts`

사용하는 shared API:

- `Main`, `IconButton`, `FilterPill`, `Card`, `BodyPartIconHost`
- `useCardColors`
- `formatMonthYear`, `formatDateWithDay`, `bodyPartLabel`
- `groupByMonth`

주요 side effect:

- month-based stored session and HealthKit summary reads
- AppState/자정 refresh
- route push to workout result

### `view-calendar`

운동 캘린더 화면이다. `/calendar`에서 `WorkoutNavigationGuard`와 함께 `CalendarScreen`이 렌더링된다.

주요 흐름:

- `useCalendarRefreshSignal`이 화면 focus, 앱 active, 자정 경계에서 오늘 기준 날짜와 refresh key를 갱신한다.
- `useCalendarYearSelection`이 첫 완료 운동 월부터 현재 월까지의 연도 목록과 선택 연도의 월 목록을 만든다.
- `CalendarScreen`은 현재 연도를 기본 선택하고 연도 `Chip`을 가로 목록으로 제공한다.
- `MonthGrid`가 월별 날짜 grid를 만들고, `useMonthWorkoutDates`가 해당 월 저장 세션을 조회한다.
- `DayCell`은 대표 body part/cardio badge를 보여주고, 여러 badge는 long press tooltip으로 보여준다.
- 운동이 있는 날짜 press 시 `/workout/[id]`로 이동한다.

주요 컴포넌트:

- `CalendarScreen`
- `MonthGrid`
- `DayCell`
- `BodyPartBadge`

사용하는 `entities/workout-session` API:

- `getStoredWorkoutSessionsInRange`
- `getAllStoredWorkoutSessions`
- `getUniqueWorkoutBodyParts`
- `BodyPart` type

사용하는 shared API:

- `Main`, `IconButton`, `Chip`, `BodyPartIcon`
- `useCardColors`
- `getFirstDayOfWeek`, `getDaysInMonth`, `getLocalDateKeyFromIso`, `getYearMonthFromIso`

주요 side effect:

- month range stored session reads
- screen focus/AppState/자정 refresh
- route push to workout result

### `view-proteins`

프로틴 목록 화면이다. `app/(tabs)/protein.tsx`에서 `ProteinListScreen`으로 진입한다. 화면 계약은 [프로틴 기능서](../../docs/page/10_protein.md)를 따른다.

주요 흐름:

- 상품 목록과 최신 가격을 함께 조회한다.
- `mergeProteinListItems`로 list model을 조립한다.
- category filter로 목록을 거른다.
- `ProteinCard` press 시 `/protein/[id]`로 이동한다.
- loading/error/empty 상태를 화면 안에서 처리한다.

주요 컴포넌트:

- `ProteinListScreen`
- entity UI인 `ProteinCard`, `CoupangPartnersDisclosure`

사용하는 `entities/protein` API:

- `fetchProteins`
- `fetchLatestProteinPrices`
- `mergeProteinListItems`
- `getProteinCategoryLabel`
- `ProteinCard`
- `CoupangPartnersDisclosure`

사용하는 shared API:

- `Main`
- `FilterPill`

주요 side effect:

- Supabase product/latest price fetch through entity API
- route push to protein detail

### `view-protein-detail`

프로틴 상세 화면이다. `/protein/[id]`에서 `WorkoutNavigationGuard`와 함께 `ProteinDetailScreen`이 렌더링된다.

주요 흐름:

- route `id`가 없거나 배열이면 안전하게 단건 string으로 좁힌다.
- 상품, 가격 히스토리, 맛 정보를 함께 조회한다.
- `buildProteinDetail`로 상세 model을 조립한다.
- 가격/단위/특징/가격 추이를 렌더링한다.
- `PriceTrendChart`는 날짜·가격 표시 입력을 만들고, 심박 차트와 동일한 스타일·점 선택 동작은 `MetricChart`가 처리한다.
- 구매 버튼은 비활성 상태로 표시한다.
- loading/error/not found 상태를 화면 안에서 처리한다.

주요 컴포넌트:

- `ProteinDetailScreen`
- entity UI인 `PriceTrendChart`, `CoupangPartnersDisclosure`

사용하는 `entities/protein` API:

- `fetchProtein`
- `fetchProteinPrices`
- `fetchProteinFlavors`
- `buildProteinDetail`
- `PriceTrendChart`
- `CoupangPartnersDisclosure`

사용하는 shared API:

- `Badge`, `Button`, `IconButton`, `Card`
- `useCardColors`

주요 side effect:

- Supabase detail/history/flavor fetch through entity API
- safe external URL open
- route back

### `manage-settings`

설정 화면이다. `/settings`에서 `SettingsScreen`으로 진입한다.

주요 흐름:

- `SettingsScreen`이 운동/프로틴 섹션을 나누고 각 row를 렌더링한다.
- `WorkoutReminderToggle`은 매일 운동 리마인더 enabled 값과 notification sync를 관리한다.
- `WorkoutPlaceArrivalReminderToggle`은 자동 학습된 운동 장소 목록 하단시트, 개별 삭제, 장소 알림 enabled 값과 geofence 동기화를 관리한다.
- `ProteinSaleNotificationToggle`은 프로틴 세일 알림 예약/해제를 관리한다.
- `RoutineCycleToggle`은 `useRoutineCyclePlan`을 사용하고, `routineSetup=1` param이면 설정 sheet를 연다.
- `RoutineCycleSettingsSheet`와 `RoutineSettingsEditors`가 루틴 사이클 split/cycle/body part 설정을 편집한다.
- 루틴 세부 설정은 iOS 기본 page sheet의 아래로 끌어 닫기를 사용한다. 저장 중에는 스와이프와 일반 닫기를 막고, 취소 시 기존 draft 폐기·최초 루틴 활성화 취소 흐름을 따른다.

주요 컴포넌트:

- `SettingsScreen`
- `SettingsRow`
- `RoutineCycleToggle`
- `RoutineCycleSettingsSheet`
- `RoutineSettingsEditors`
- `WorkoutReminderToggle`
- `WorkoutPlaceArrivalReminderToggle`
- `WorkoutPlaceListSheet`
- `ProteinSaleNotificationToggle`

사용하는 `entities/workout-session` API:

- `getWorkoutReminderEnabled`, `setWorkoutReminderEnabled`, `syncWorkoutReminderAtNight`
- `getWorkoutPlaces`, `deleteWorkoutPlace`
- `getWorkoutPlaceReminderEnabled`, `setWorkoutPlaceReminderEnabled`, `disableWorkoutPlaceArrivalReminder`, `rebuildAndSyncWorkoutPlaceArrivalReminder`
- routine cycle defaults/types/constants/session resize API

사용하는 `entities/protein` API:

- 프로틴 세일 알림 scheduler/storage API

사용하는 shared API:

- `Main`, `IconButton`, `GlassSurface`
- `useResolvedColorToken`, `semanticColorTokens`
- `bodyPartLabel`, `bodyPartDetailLabel`

주요 side effect:

- notification permission/schedule/cancel through entity or shared notification APIs
- routine cycle storage save through `useRoutineCyclePlan`
- route back

### `use-tempo`

템포 타이머 화면이다. `/(tabs)/tempo`에서 `TempoScreen`으로 진입하고, 운동 중 drawer에서는 `/(tabs)/tempo?fromWorkout=1`로 진입한다.

주요 흐름:

- `TempoScreen`이 `tempoReducer`와 `useTempoTimer`를 조합한다.
- `TempoModeButtons`와 `TempoSettings`가 mode/초/횟수/세트/휴식 설정을 바꾼다.
- `TempoRingDisplay`가 `RingProgress`로 countdown/tempo/rest 진행률을 보여준다.
- `useTempoTimer`는 countdown, contraction, relaxation, count, rest phase를 계산하고 sound/haptic side effect를 초 단위로 실행한다.
- `fromWorkout=1`이면 route wrapper가 back button을 넘기고 `/workout/active`로 replace한다.

주요 컴포넌트:

- `TempoScreen`
- `TempoModeButtons`
- `TempoSettings`
- `TempoRingDisplay`

사용하는 entities API:

- feature 내부에서는 직접 사용하지 않는다. 운동 화면과의 연결은 `do-workout` route push와 app route wrapper가 담당한다.

사용하는 shared API:

- `Main`, `Button`, `IconButton`, `Stepper`, `RingProgress`
- `useCardColors`

주요 side effect:

- `expo-audio` audio player init/play/cleanup
- `expo-haptics` feedback
- `requestAnimationFrame`
- AppState active 시 timer sync

## Loading / Error / Empty 기준

- 화면 진입 직후 외부 데이터가 필요하면 loading 상태를 명확히 둔다.
- route param이 없거나 잘못된 경우 loading에 머물지 말고 empty/not found 상태로 끝낸다.
- 목록은 `loading`, `error`, `empty`, `content`를 서로 겹치지 않게 렌더링한다.
- 저장소/HealthKit/알림처럼 실패해도 핵심 화면을 계속 보여줄 수 있는 side effect는 안전한 fallback 상태로 바꾼다.
- Supabase 조회 실패는 feature가 error UI를 낼 수 있게 처리한다.
- 오래된 async 응답은 `cancelled`, `active`, request id 같은 guard로 무시한다.

## 접근성 기준

- 아이콘만 있는 버튼은 `accessibilityLabel`을 반드시 넣는다.
- `Pressable` 기반 버튼은 `accessibilityRole="button"`을 명시한다.
- filter/chip/선택형 control은 `accessibilityState.selected` 또는 `checked`를 명시한다.
- disabled/busy 상태가 있는 control은 `accessibilityState.disabled` 또는 `busy`를 명시한다.
- `Switch`는 title/body를 label/hint로 연결하고 checked/disabled 상태를 넘긴다.
- 텍스트 없는 close overlay는 label을 제공한다.
- 터치 control은 `h-yb-touch`, `h-yb-btn-*`, `h-yb-icon-btn`, `h-yb-chip` 같은 token 크기를 우선 사용한다.

## Design Tokens / Glass UI 기준

- RN `View`, `Text`, `Pressable` 스타일은 `yb-*` class token을 우선 사용한다.
- 실제 색상 문자열이 필요한 SVG/Skia/Symbol/SwiftUI/placeholder에는 `useCardColors()` 또는 `useResolvedColorToken()`을 사용한다.
- 색상 hex를 feature에 직접 추가하지 않는다. 먼저 shared token/hook으로 표현 가능한지 확인한다.
- glass 표면은 `GlassSurface`, `GlassBackground`, `GlassCircleBackground`, 또는 `Card variant="glass"`를 사용한다.
- `primitive.json`은 feature에서 직접 import하지 않는다.
- 반복되는 크기/간격은 기존 token을 우선 쓰고, 한 번만 쓰이며 의미가 분명한 값은 억지로 상수화하지 않는다.

## Try/Catch 기준

- 외부 세계와 만나는 작은 범위에만 `try/catch`를 둔다.
- 허용 예: network/Supabase, AsyncStorage, HealthKit, calendar, location, notification, external URL, JSON parse.
- catch가 잡는 실패를 한 문장으로 설명할 수 있어야 한다.
- 함수 전체나 여러 책임을 한 번에 감싸지 않는다.
- 조건문으로 막을 수 있는 타입/param 문제는 `try/catch`로 처리하지 않는다.
- 조용히 삼키는 catch는 실패해도 핵심 흐름을 막지 않는 side effect에만 허용한다.
- 실패 후 상태는 `false`, `null`, `[]`, 기본 상태, error UI 중 하나로 명확히 둔다.

## 중복 로직 정리 기준

- 같은 feature 내부에서만 반복되면 해당 feature의 `model`, `lib`, `ui`로만 뺀다.
- 도메인 데이터, 저장소 key, HealthKit/알림/Supabase 규칙은 `entities`로 둔다.
- 화면 조합, route 이동, 화면 전용 UI 상태는 feature에 둔다.
- 도메인과 무관하고 세 번째 사용처가 예상되는 순수 유틸만 `shared`로 올린다.
- shared에는 route, 화면명, workout/protein 저장 구조 같은 지식을 넣지 않는다.
- entities에는 특정 화면의 UI 상태나 route 지식을 넣지 않는다.
- 두 곳에서 반복된다는 이유만으로 shared로 올리지 않는다.
- 공통화 후 읽기 어려워지면 중복을 유지한다.

## 하드코딩 값 처리 기준

- 사용자 문구는 i18n key를 우선 사용한다.
- route 문자열은 feature/app에서 쓰되, 여러 곳에서 의미가 완전히 같아지고 변경 가능성이 생기면 상수화를 검토한다.
- storage key, notification id, event id는 feature에 흩뿌리지 말고 해당 책임 모듈에서 의미 있는 상수로 관리한다.
- 색상 hex는 feature에 직접 두지 않는다. token/hook으로 대체한다.
- 반복되는 임계값/크기는 token 또는 feature 내부 상수로 올린다.
- 한 번만 쓰이고 UI 의미가 즉시 보이는 숫자는 유지할 수 있다.
- 토큰/상수로 바꿨을 때 더 읽기 어려우면 유지한다.

## 수정 전 체크 명령어

features를 수정하기 전후에는 최소한 아래 명령어를 확인한다.

```bash
bunx tsc --noEmit --pretty false
bun run lint
git diff --check
rg -n "#[0-9A-Fa-f]{3,8}" src/features
rg -n "px-\\[|py-\\[|pt-\\[|pb-\\[|pl-\\[|pr-\\[|m-\\[|w-\\[|h-\\[|min-h-\\[|max-w-\\[" src/features
rg -n "Linking.openURL|router\\.push|router\\.replace|AsyncStorage\\.|Notifications\\." src/features
```
