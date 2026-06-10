# Feature-Sliced Design (FSD) 아키텍처 가이드

## 계층 구조

```
app/              - 앱 설정, Provider, 라우터
features/         - 사용자 행동 (동사)
entities/         - 도메인 데이터 (명사)
shared/           - 범용 유틸리티
```

**의존성 방향** (아래에서 위로만):
```
app
 ↑
features
 ↑
entities
 ↑
shared
```

**핵심 규칙**: 같은 Layer끼리는 서로 import 불가!

---

## 계층별 역할

### Shared - 범용 유틸리티

도메인 모르는 순수 기술 코드. 비즈니스 로직 없음.

```
shared/
  ├── ui/              - Button, Input, Modal
  ├── lib/             - formatDate, validateEmail
  └── hooks/           - useDebounce, usePagination
```

### Entities - 도메인 모델

비즈니스 핵심 데이터와 표현. **명명: 명사** (workout, exercise, protein)

```
entities/workout/
  ├── ui/
  │   ├── WorkoutCard.tsx
  │   └── WorkoutList.tsx
  ├── api/
  │   └── workoutApi.ts
  ├── model/
  │   ├── types.ts
  │   └── hooks.ts
  └── index.ts
```

**Entity가 하는 것**: 데이터 구조 정의, CRUD, 데이터 표시 UI
**Entity가 안 하는 것**: 사용자 행동, 복잡한 비즈니스 로직, 다른 Entity 조합

### Features - 사용자 행동

사용자가 수행하는 행동. **명명: 동사** (start-workout, log-set, track-tempo)

```
features/start-workout/
  ├── ui/
  │   └── StartWorkoutButton.tsx
  ├── model/
  │   └── useStartWorkout.ts
  └── index.ts
```

### App - 애플리케이션 설정

```
app/
  ├── providers/       - ThemeProvider, AuthProvider
  ├── router/          - 라우팅 설정 (Expo Router)
  └── styles/          - 전역 스타일
```

---

## 3개 질문으로 계층 구분

```
Q1. 도메인을 알고 있나?
    │
    ├─ NO → shared/
    └─ YES → Q2로

Q2. Feature(행동)를 사용하나?
    │
    ├─ NO → entities/
    └─ YES → features/
```

---

## Slice 내부 구조

```
entities/workout/
  ├── ui/           - UI 컴포넌트
  ├── api/          - HTTP 통신
  ├── model/        - 타입, 훅, 스토어
  │   ├── types.ts
  │   ├── hooks.ts
  │   └── store.ts  (선택)
  ├── lib/          - 헬퍼 함수 (선택)
  └── index.ts      - Public API (필수!)
```

---

## Public API 패턴

각 Slice는 반드시 `index.ts`를 통해서만 공개:

```typescript
// entities/workout/index.ts
export { WorkoutCard, WorkoutList } from './ui';
export { getWorkouts } from './api/workoutApi';
export { useWorkouts } from './model/hooks';
export type { Workout } from './model/types';
```

```typescript
// 올바른 import
import { WorkoutCard } from '@/entities/workout';

// 잘못된 import
import { WorkoutCard } from '@/entities/workout/ui/WorkoutCard';
```

---

## 의존성 규칙

### 가능
```typescript
// features/start-workout/
import { Workout } from '@/entities/workout';       // 하위 Layer
import { Button } from '@/shared/ui/Button';         // 하위 Layer
import { useStartWorkout } from '../model/hooks';    // 같은 Slice
```

### 불가능
```typescript
// entities/workout/
import { StartWorkout } from '@/features/start-workout';  // 상위 Layer

// features/start-workout/
import { useLogSet } from '@/features/log-set';            // 같은 Layer 다른 Slice
```

같은 Layer에서 공유 필요 → 하위 Layer로 이동

---

## 헷갈리는 케이스

### props로 받는 onClick → entities

```tsx
function WorkoutCard({ workout, onStart, onDelete }) {
  return (
    <View>
      <Pressable onPress={onStart}>시작</Pressable>
    </View>
  );
}
// Feature 훅 직접 사용 안 함 → entities/workout/
```

### 순수 UI 상태 (탭 전환 등) → entities

```tsx
function WorkoutDetail({ workout }) {
  const [tab, setTab] = useState('sets');
  // 탭 전환은 순수 UI 상태 → entities/workout/
}
```

---

## 실전 팁

1. **불분명하면 Feature에** → 나중에 여러 곳에서 쓰면 Entity로 이동
2. **index.ts는 필수** → Public API 패턴으로 리팩토링 용이
3. **Segment는 필요한 것만** → 모든 Slice에 ui, api, model, lib 불필요
4. **같은 Layer 공유 금지** → import 필요하면 하위 Layer로 이동

---

## 빠른 참조

| 계층 | 역할 | 명명 | 예시 |
|------|------|------|------|
| **shared** | 범용 유틸 | 기술명 | Button, formatDate, useDebounce |
| **entities** | 도메인 데이터 | 명사 | workout, exercise, protein |
| **features** | 사용자 행동 | 동사 | start-workout, log-set, track-tempo |
| **app** | 전역 설정 | - | providers, router |

## 구분 체크리스트

- [ ] 도메인을 모른다 → **shared**
- [ ] 데이터만 표시한다 → **entities**
- [ ] Feature 훅을 사용한다 → **features**
- [ ] 전역 설정이다 → **app**
