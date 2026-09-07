# Feature-Sliced Design (FSD) 아키텍처 가이드

이 문서는 이 저장소의 경계 판단과 import 규칙을 요약한다. 수정 대상 레이어의 `src/entities/README.md`, `src/features/README.md`, `src/shared/README.md`와 실제 import 사용처를 함께 읽는다. 예시를 맞추기 위한 폴더 생성이나 경계 이동은 하지 않는다.

## 계층 구조와 의존성

```text
src/
├── app/        # Expo Router 파일 기반 route, Provider, 앱 초기화
├── features/   # 화면 흐름, 사용자 액션 조합, 화면 전용 상태
├── entities/   # 도메인 모델, 상태 전이, 저장소와 외부 side effect
└── shared/     # 공용 UI, 훅, 유틸, 다국어 리소스
```

허용되는 의존성 방향은 **상위 레이어 → 하위 레이어**다.

```text
app → features → entities → shared
```

중간 레이어를 건너뛰어 하위 레이어를 사용할 수 있다. 예를 들어 `app`은 `WorkoutProvider`나 공용 UI를 직접 import할 수 있다.

- `features`의 서로 다른 slice끼리, `entities`의 서로 다른 slice끼리 직접 import하지 않는다.
- 같은 slice 안에서는 상대 경로로 내부 파일을 import한다.
- `app`의 route 조합과 `shared` 내부 segment 간 재사용에는 slice 간 import 금지를 적용하지 않는다. 순환 의존성은 만들지 않는다.
- `shared`에서 feature/entity를, entity에서 feature/app을 import하지 않는다.

## 경계 판단

| 코드 성격 | 위치 | 현재 예시 |
| --- | --- | --- |
| route 및 앱 초기화, 여러 feature 조합 | `app` | `src/app/_layout.tsx`, `src/app/(tabs)/index.tsx` |
| 사용자 액션, 라우팅, 화면 전용 상태 | `features/<행동>` | `do-workout`, `view-result`, `manage-settings` |
| 도메인 상태·규칙, 저장소·외부 API | `entities/<도메인>` | `workout-session`, `protein` |
| 도메인 UI 부품 | `entities/<도메인>/ui` | `BodyPartIcon`, `ProteinCard` |
| 도메인 없는 공용 UI·훅·유틸 | `shared` | `Button`, `useResolvedColorToken`, `parseJsonOrNull` |

판단은 코드가 맡은 책임으로 한다. 복잡한 로직이라는 이유만으로 entity에서 feature로 옮기지 않는다. 현재 운동 상태, HealthKit, 캘린더 연동, 알림 예약, 루틴 계산은 `workout-session` entity가 맡는다. 화면 진입과 이동, drawer 열림, 편집 모드 등은 feature/app 책임이다.

콜백을 props로 받는 것만으로 entity가 feature가 되지는 않는다. 반대로 feature 훅을 사용하지 않는다는 이유만으로 모든 UI 상태를 entity에 두지 않는다.

여러 feature에서 필요한 도메인 규칙은 entity에 둘 수 있고, feature 조합은 app에서 처리할 수 있다. 도메인 이름과 정책이 남아 있는 코드를 import 규칙만 맞추려고 shared로 옮기지 않는다. 재사용 근거가 없으면 해당 slice 안의 좁은 위치를 유지한다.

## Slice 내부 구조

```text
entities/workout-session/
├── api/        # 네이티브/외부 데이터 연동
├── model/      # 타입, 상태, 훅, 저장소
├── lib/        # 도메인 계산 및 side effect
├── ui/         # 도메인 UI 부품
└── index.ts    # 외부 공개 API
```

segment는 필요한 것만 만든다. 새 slice마다 `ui`, `api`, `model`, `lib`를 모두 생성할 필요는 없다.

## Public API와 import

feature/entity의 외부 소비자는 해당 slice의 `index.ts`를 사용한다. 필요한 값과 타입만 명시적으로 공개한다.

```ts
// src/entities/workout-session/index.ts의 공개 API 예
export { WorkoutProvider, useWorkout } from './model/WorkoutContext';
export type { StoredWorkoutSession } from './model/types';

// feature에서 하위 레이어 사용
import { useWorkout } from '@/entities/workout-session';
import { Button } from '@/shared/ui/Button';

// src/features/start-workout/ui 안에서 같은 slice 내부 사용
import { useCountdown } from '../lib/useCountdown';
```

금지되는 import 예:

```ts
// 다른 slice의 내부 경로에 의존
import { useWorkout } from '@/entities/workout-session/model/WorkoutContext';

// entity에서 상위 레이어에 의존
import { CountdownScreen } from '@/features/start-workout';

// 다른 feature에서 같은 레이어의 slice에 의존
import { ResultScreen } from '@/features/view-result';
```

`shared`는 slice별 barrel 구조를 사용하지 않는다. 현재 공개 방식인 `@/shared/ui/Button`, `@/shared/hooks/useCardColors`, `@/shared/lib/designTokens`처럼 파일 경로를 사용한다. 가이드의 통일성을 위해 `shared/index.ts`나 `shared/ui/index.ts`를 새로 만들지 않는다.

## 변경 전후 확인

1. 관련 레이어 README와 `rg` 검색으로 구현, 공개 export, 소비자를 확인한다.
2. 책임이 잘못 놓였다는 근거가 있을 때 경계를 이동한다. 사용자 흐름은 `docs/page/*.md`와 대조한다.
3. 공개 API를 바꾸면 `index.ts`와 소비자를 함께 확인하고 순환 import를 만들지 않는다.
4. 기존 deep import 등 규칙과 다른 코드를 발견하면 현재 변경과의 관련성을 판단한다. 기존 사용처를 새 규칙으로 일반화하거나 무관한 전체 리팩터링을 하지 않는다.
5. 변경한 동작과 경계에 필요한 검사만 실행하고 실행 결과와 확인하지 못한 부분을 보고한다.
