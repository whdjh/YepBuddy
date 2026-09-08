# YepBuddy 앱 개요와 기능 탐색

> 확인일: 2026-09-07. 이 문서는 작업에 필요한 기능서와 코드의 진입점을 안내한다.

## 문서의 역할

- 화면 동작과 사용자 흐름의 canonical source는 [docs/page/README.md](../docs/page/README.md)에 연결된 `docs/page/*.md`다. 같은 이름의 HTML은 열람용 산출물이다.
- 이 문서에는 상세 UI, 입력 기본값, 저장 필드, 권한 분기, 알고리즘을 중복 명세하지 않는다. 해당 기능서와 구현에서 확인한다.
- 현재 요청을 먼저 기준으로 삼고, 관련 기능서와 코드를 대조한다. 둘이 다르면 차이와 근거를 확인하고 작업 범위 안에서 정합성을 맞춘다. 코드만 보고 새 제품 결정을 만들지 않는다.
- `docs/plans/`의 계획이나 과거 디자인 시안을 현재 구현 또는 승인된 추가 작업으로 취급하지 않는다.

## 프로젝트 개요

YepBuddy(옙버디)는 운동 기록, 루틴 사이클, 운동 템포, 프로틴 가격 조회를 제공하는 iOS 및 Android 앱이다. 지원 플랫폼은 [README](../README.md)와 [app.json](../app.json), 설치된 의존성과 실행 명령은 [package.json](../package.json) 및 `bun.lock`에서 확인한다.

| 영역 | 현재 사용 구성 | 확인 위치 |
| --- | --- | --- |
| 앱·라우팅 | Expo, React Native, TypeScript, Expo Router | `src/app/`, `package.json` |
| 운동 상태·저장 | React Context, reducer, AsyncStorage | `src/entities/workout-session/model/` |
| 스타일 | NativeWind, Tailwind CSS, 디자인 토큰 | `src/tokens/`, `src/global.css`, `tailwind.config.js` |
| 템포 | 별도 타이머 상태, 오디오, 햅틱 | `src/features/use-tempo/` |
| 기기 연동 | 캘린더, 위치, 알림 | `src/entities/workout-session/lib/`, `app.json` |
| iOS 운동 연동 | HealthKit, `WorkoutSession` 네이티브 모듈, Live Activity | `src/entities/workout-session/api/`, `plugins/` |
| 프로틴 | Supabase 조회, 가격 데이터 변환, 세일 알림 | `src/entities/protein/` |
| 번역 | i18next, react-i18next, 앱 번역 리소스 | `src/shared/i18n/` |

플랫폼별 렌더링과 기능 지원은 동일하다고 가정하지 않는다. 스타일과 컴포넌트 선택은 [디자인 원칙](design-principles.md), [디자인 토큰](design-tokens.md), [컴포넌트 가이드](component-guide.md)를 함께 확인한다.

## 화면과 기능 진입점

아래 코드 경로는 `mobile/` 기준이다. 변경할 화면의 기능서를 먼저 읽고 해당 라우트와 feature에서 필요한 범위만 추적한다.

| 화면·기능 | Canonical 문서 | 라우트·구현 진입점 |
| --- | --- | --- |
| 일지·요약 카드·루틴 진행 | [01_main.md](../docs/page/01_main.md) | `src/app/(tabs)/index.tsx`, `src/features/view-summary/` |
| 운동 결과·메모·세트 편집·삭제 | [02_result.md](../docs/page/02_result.md) | `src/app/workout/[id].tsx`, `src/features/view-result/` |
| 캘린더·기기 일정 연결 | [03_calendar.md](../docs/page/03_calendar.md) | `src/app/calendar.tsx`, `src/features/view-calendar/` |
| 전체 세션 목록·부위 필터 | [04_sessions.md](../docs/page/04_sessions.md) | `src/app/sessions.tsx`, `src/features/view-sessions/` |
| 카운트다운·운동 실행·완료·복구 | [05_workout.md](../docs/page/05_workout.md) | `src/app/workout/`, `src/features/start-workout/`, `src/features/do-workout/` |
| 템포 | [06_tempo.md](../docs/page/06_tempo.md) | `src/app/(tabs)/tempo.tsx`, `src/features/use-tempo/` |
| 알림·Live Activity·알림 탭 이동 | [07_notification.md](../docs/page/07_notification.md) | `src/app/_layout.tsx`, `src/features/protein-sale-notification/`, `src/entities/workout-session/`, `plugins/ios/workout-live-activity/` |
| 루틴·캘린더·알림 설정 | [08_settings.md](../docs/page/08_settings.md) | `src/app/settings.tsx`, `src/features/manage-settings/` |
| 운동 장소 학습·도착 알림 | [09_workout_place_reminder.md](../docs/page/09_workout_place_reminder.md) | `src/entities/workout-session/lib/workoutPlaceArrivalReminder.ts`, `src/entities/workout-session/lib/workoutPlaceArrivalTask.ts` |

프로틴 목록·상세·가격 차트의 화면 동작은 [10_protein.md](../docs/page/10_protein.md)를 따른다.

## 현재 기능 경계

- **탭:** [탭 레이아웃](../src/app/(tabs)/_layout.tsx)은 일지와 템포를 표시한다. `PROTEIN_TAB_ENABLED = false`는 프로틴 탭을 숨기지만 목록·상세 라우트와 세일 알림 코드는 남아 있다. 플래그만 보고 프로틴 전체가 제거되었다고 판단하지 않는다.
- **운동 복구:** 진행 중 운동은 로컬 스냅샷을 복원한다. [WorkoutNavigationGuard](../src/features/do-workout/ui/WorkoutNavigationGuard.tsx)는 복원 이후 `recording`·`paused` 상태를 기준으로 운동 화면 복귀를 처리하며 템포 경로를 허용한다. 운동 완료와 폐기는 서로 다른 저장·기기 연동 경로다.
- **오늘 운동:** [요약 카드](../src/features/view-summary/ui/SummaryCardRenderer.tsx)는 오늘 완료 여부로 운동 시작 카드를 비활성화한다. 이를 저장소 전체의 하루 1세션 제약으로 확대 해석하지 않는다. 대표 세션 선택과 루틴 사이클 계산은 메인 기능서를 따른다.
- **기기 캘린더:** 자동 저장 선호값은 신규 이벤트 생성을 제어한다. 이미 연결된 이벤트의 수정·삭제와 권한 실패 처리는 결과·캘린더 기능서의 계약을 따른다.
- **템포:** 운동 기록 타이머와 별도 상태를 사용하지만 운동 중 화면에서 진입할 수 있다. 준비 카운트다운, 입력 잠금, 화면 이탈과 앱 복귀 처리의 제약은 템포 기능서를 따른다.
- **iOS 전용 기능:** HealthKit 실시간 지표와 운동 Live Activity는 별도 네이티브 경계를 가진다. 관련 작업은 [plugins/README.md](../plugins/README.md)와 `plugins/ios/` 원본을 읽는다. 타입이나 파일에 Watch 관련 이름이 존재하는 것만으로 Apple Watch companion 또는 mirroring 지원을 단정하지 않는다.
- **프로틴:** 현재 상세 화면의 구매 버튼은 비활성 상태다. 서버의 수집 주기, RLS 정책, 가격 등급 산정 규칙은 모바일 조회 코드만으로 운영 상태를 보장할 수 없으므로 관련 서버 근거가 필요하다.
- **위젯:** 구현된 `WorkoutLiveActivityExtension`은 진행 중 운동 제어용이다. 과거 명세의 월별 운동 잔디 위젯은 현재 구현으로 확인되지 않으며, 이 문서가 추가 구현을 지시하지 않는다.

## 변경 시 문서 유지

상세 동작 변경은 관련 `docs/page/*.md`에 반영한다. 이 문서는 플랫폼, 기능 범위, 라우트 또는 구현 진입점이 바뀔 때 갱신한다. 상태·저장 계약은 [Entities 가이드](../src/entities/README.md), 화면 흐름과 계층 경계는 [Features 가이드](../src/features/README.md) 및 [FSD 가이드](fsd-architecture.md)를 확인한다.
