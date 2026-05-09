# "이번 주 세션" 카드 → "분할 루틴" 타이틀 변경 + 진행 배지 추가 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메인 화면의 `이번 주 세션` 카드 타이틀을 `분할 루틴`으로 변경하고, 우측에 `현재 / 총` 형태의 진행 배지(예: `3 / 8`)를 추가한다.

**Architecture:** "주(week)" 단어가 가지는 고정 시간 단위(월~일) 함축을 제거하고, 운동 사이클의 진행 위치를 명확히 보여주도록 변경. `Card.Header` 컴포넌트에 `badge` prop을 추가하여 재사용 가능한 형태로 구현. 진행률 데이터는 기존 `useWeeklyRoutinePlan`의 `progress`에서 가져와 wiring한다.

**Tech Stack:**
- React Native (Expo) + TypeScript
- react-i18next (i18n)
- NativeWind (Tailwind CSS)
- 기존 `Card`, `Card.Header` 컴포넌트 (`mobile/src/shared/ui/Card.tsx`)

---

## 변경 매핑

| 항목 | 현재 | 변경 후 |
|------|------|--------|
| 카드 타이틀 (한국어) | `이번 주 세션` | `분할 루틴` |
| 카드 타이틀 (영어) | `This Week` | `Routine Split` |
| 우측 배지 | 없음 | `{현재 세션 번호} / {총 세션 수}` 예: `3 / 8` |

**i18n 키 이름은 변경하지 않는다.** (`thisWeekSessions`는 코드 식별자이므로 그대로 유지하여 변경 범위 최소화. 추후 필요 시 별도 PR로 정리)

---

## 영향받는 파일 목록

**필수 수정:**
- `mobile/src/shared/i18n/locales/ko.json:217` — 한국어 라벨 텍스트
- `mobile/src/shared/i18n/locales/en.json:217` — 영어 라벨 텍스트
- `mobile/src/shared/ui/Card.tsx:90-116` — `Header` 컴포넌트에 `badge` prop 추가
- `mobile/src/features/view-summary/ui/WeeklySessionList.tsx` — 진행 배지 prop 추가, Header에 `badge` 전달
- `mobile/src/features/view-summary/ui/SummaryCardRenderer.tsx` — `WeeklySessionList`에 진행률 데이터 전달
- `mobile/src/features/view-summary/model/useSummaryCardData.ts` — `useWeeklyRoutinePlan` progress에서 current/total 추출하여 노출

**점검 후 필요 시 수정:**
- `mobile/src/shared/i18n/locales/ko.json:234` — `cardLabels.weeklySessions` (카드 관리 UI에 노출되는 라벨, 일관성을 위해 함께 변경 권장)
- `mobile/src/shared/i18n/locales/en.json:234`

**문서 갱신 (서비스 표기와 docs 일치):**
- `mobile/docs/page/01_main.md` — 여러 곳에 "이번 주 세션" 표현 등장 (5.7, 5.8, 6.x 등)
- `mobile/docs/page/02_result.md`
- `mobile/docs/page/04_sessions.md`
- `mobile/.claude/app-spec.md`
- `mobile/src/features/README.md`
- `docs/README.md`

---

## 데이터 소스 확인 (사전 조사)

`현재 / 총` 진행률 데이터는 `useWeeklyRoutinePlan` 훅이 반환하는 `progress: WeeklyRoutineProgress` 안에 이미 있을 가능성이 높다. Task 4에서 정확한 필드명을 확인 후 wiring한다.

**확인 명령:**
```bash
grep -rn "interface WeeklyRoutineProgress\|type WeeklyRoutineProgress" mobile/src/entities/workout-session/
```

찾은 타입 정의에서 다음 같은 필드를 확인:
- 완료된 세션 수: `completedCount`, `doneCount`, `current` 등
- 전체 세션 수: `totalCount`, `plannedCount`, `total` 등
- 분할 수: `splitCount`

만약 적절한 필드가 없다면 새로 계산해야 함 (Task 4 단계에서 결정).

---

## Task 1: i18n 라벨 텍스트 변경

**Files:**
- Modify: `mobile/src/shared/i18n/locales/ko.json:217`
- Modify: `mobile/src/shared/i18n/locales/en.json:217`

- [ ] **Step 1: 한국어 라벨 변경**

`mobile/src/shared/i18n/locales/ko.json` 217번째 줄:
```diff
-    "thisWeekSessions": "이번 주 세션",
+    "thisWeekSessions": "분할 루틴",
```

- [ ] **Step 2: 영어 라벨 변경**

`mobile/src/shared/i18n/locales/en.json` 217번째 줄:
```diff
-    "thisWeekSessions": "This Week",
+    "thisWeekSessions": "Routine Split",
```

- [ ] **Step 3: 카드 관리 UI 라벨도 일관성 있게 변경 (권장)**

`mobile/src/shared/i18n/locales/ko.json` 234번째 줄:
```diff
-      "weeklySessions": "이번 주 세션"
+      "weeklySessions": "분할 루틴"
```

`mobile/src/shared/i18n/locales/en.json` 234번째 줄:
```diff
-      "weeklySessions": "This Week"
+      "weeklySessions": "Routine Split"
```

- [ ] **Step 4: 검증**

Run: `cd mobile && bun start`
- 메인 화면 진입 → 기존 "이번 주 세션" 카드 타이틀이 "분할 루틴"으로 표시되는지 확인
- 카드 길게 누르기 → 카드 관리 시트에서 라벨도 "분할 루틴"으로 보이는지 확인

---

## Task 2: `Card.Header` 컴포넌트에 `badge` prop 추가

**Files:**
- Modify: `mobile/src/shared/ui/Card.tsx:90-116`

- [ ] **Step 1: Header props에 `badge` 추가**

```tsx
function Header({ label, chevron, more, onMorePress, badge }: {
  label: string
  chevron?: boolean
  more?: string
  onMorePress?: () => void
  badge?: string
}) {
  const { fgSecondary, accent } = useCardColors()
  return (
    <HStack>
      <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
        {label}
      </SwiftText>
      <Spacer />
      {badge && (
        <SwiftText modifiers={[font({ size: 13, weight: "semibold" }), foregroundStyle(accent)]}>
          {badge}
        </SwiftText>
      )}
      {more && (
        <SwiftText modifiers={[font({ size: 13, weight: "medium" }), foregroundStyle(fgSecondary)]}>
          {more}
        </SwiftText>
      )}
      {(chevron || onMorePress) && (
        <Image
          systemName="chevron.right"
          size={chevron ? 14 : 12}
          color={chevron ? fgSecondary : accent}
          onPress={onMorePress}
        />
      )}
    </HStack>
  )
}
```

배치 순서: `[label] [Spacer] [badge] [more] [chevron]`. 배지가 더보기 링크 왼쪽에 위치.

- [ ] **Step 2: 타입 체크**

Run: `cd mobile && bunx tsc --noEmit`
Expected: 에러 없음

---

## Task 3: 진행률 데이터 추출 — `useSummaryCardData` 확장

**Files:**
- Modify: `mobile/src/features/view-summary/model/useSummaryCardData.ts`

- [ ] **Step 1: `WeeklyRoutineProgress` 타입 확인**

Run: `grep -rn "interface WeeklyRoutineProgress\|type WeeklyRoutineProgress" mobile/src/entities/workout-session/`

찾은 정의에서 사용 가능한 필드를 확인하여 다음 두 값을 매핑:
- `currentSession`: 현재까지 완료된(또는 진행 중인) 세션 번호
- `totalSessions`: 사이클의 총 세션 수 (= 분할 수)

- [ ] **Step 2: `useSummaryCardData` 반환 객체에 `routineProgress` 추가**

```ts
// 기존 반환 객체에 추가
return {
  // ... 기존 필드
  weeklySessions,
  weeklyRoutinePlan,
  routineProgress: {
    current: weeklyRoutinePlan.progress.completedCount, // 실제 필드명에 맞게 조정
    total: weeklyRoutinePlan.progress.totalCount,       // 실제 필드명에 맞게 조정
  },
}
```

만약 `progress`에서 직접 `total`이 노출되지 않으면 `weeklyRoutinePlan.settings`에서 분할 수를 가져온다 (예: `settings.splitCount`).

- [ ] **Step 3: 타입 체크**

Run: `cd mobile && bunx tsc --noEmit`
Expected: 에러 없음

---

## Task 4: `WeeklySessionList`에 배지 prop 추가 및 Header 전달

**Files:**
- Modify: `mobile/src/features/view-summary/ui/WeeklySessionList.tsx`

- [ ] **Step 1: Props에 `progress` 추가**

```tsx
interface WeeklySessionListProps {
  sessions: WeeklySessionRow[]
  progress?: { current: number; total: number }
  onMorePress?: () => void
  onSessionPress?: (sessionId: string) => void
  onLongPress?: () => void
}
```

- [ ] **Step 2: Header에 badge 전달**

```tsx
export function WeeklySessionList({
  sessions,
  progress,
  onMorePress,
  onSessionPress,
  onLongPress,
}: WeeklySessionListProps) {
  const { t } = useTranslation()
  const badgeText = progress ? `${progress.current} / ${progress.total}` : undefined

  return (
    <Pressable onLongPress={onLongPress} delayLongPress={450}>
      <Card variant="glass">
        <Card.Header
          label={t("summary.thisWeekSessions")}
          badge={badgeText}
          more={t("summary.moreLink")}
          chevron
          onMorePress={onMorePress}
        />
        {/* ... 이하 기존 코드 동일 */}
```

- [ ] **Step 3: 타입 체크**

Run: `cd mobile && bunx tsc --noEmit`
Expected: 에러 없음

---

## Task 5: `SummaryCardRenderer`에서 진행률 데이터 wiring

**Files:**
- Modify: `mobile/src/features/view-summary/ui/SummaryCardRenderer.tsx:87-97`

- [ ] **Step 1: `weeklySessions` case에 progress prop 전달**

```tsx
case "weeklySessions":
  return (
    <WeeklySessionList
      sessions={weeklySessions}
      progress={routineProgress}
      onLongPress={onLongPress}
      onMorePress={() => router.push("/sessions")}
      onSessionPress={(sessionId) =>
        router.push(`/workout/${encodeURIComponent(sessionId)}`)
      }
    />
  )
```

`routineProgress`는 Task 3에서 `useSummaryCardData`가 반환하는 값. 컴포넌트 상단의 destructuring에도 추가:
```tsx
const {
  // ... 기존 필드
  weeklySessions,
  routineProgress,
} = data
```

- [ ] **Step 2: 타입 체크**

Run: `cd mobile && bunx tsc --noEmit`
Expected: 에러 없음

---

## Task 6: UI 시각 검증

**Files:**
- 수정 없음 (실행 검증만)

- [ ] **Step 1: 메인 화면 카드 외형 확인**

Run: `cd mobile && bun start`

체크 항목:
- 메인 화면 진입 시 기존 카드의 타이틀이 `분할 루틴`으로 표시
- 우측에 `3 / 8` 형태(또는 실제 진행 상태) 배지 표시
- 그 옆에 `더보기 >` 링크와 chevron이 정상 표시
- 배지의 색상이 accent(액센트 색)로 강조되어 한눈에 들어오는지

- [ ] **Step 2: 진행률이 없는 케이스 검증**

루틴 OFF 상태(또는 `progress`가 undefined인 경우)에 배지가 숨겨지는지 확인. 배지 자리만 비고 더보기/chevron은 정상 표시되어야 함.

- [ ] **Step 3: 다크모드 검증**

시스템 다크모드 토글 후 카드 외형 점검 — 배지 색상이 다크모드에서도 가독성 유지되는지 확인.

- [ ] **Step 4: 영어 로케일 검증 (선택)**

언어 설정을 영어로 바꿔서 `Routine Split  3 / 8`로 표시되는지 확인.

---

## Task 7: 문서 갱신

**Files:**
- Modify: `mobile/docs/page/01_main.md` (여러 줄)
- Modify: `mobile/docs/page/02_result.md`
- Modify: `mobile/docs/page/04_sessions.md`
- Modify: `mobile/.claude/app-spec.md`
- Modify: `mobile/src/features/README.md:52`
- Modify: `docs/README.md`

- [ ] **Step 1: 일괄 검색 및 컨텍스트 확인**

Run: `grep -rn "이번 주 세션\|이번주 세션" mobile/docs mobile/.claude mobile/src/features/README.md docs/`

각 매칭 위치를 확인하여 문맥에 맞게 변경:
- 카드 라벨/타이틀을 가리키는 곳 → `분할 루틴` 카드
- 데이터/기능 설명("이번 주 안의 세션 데이터")을 가리키는 곳 → 그대로 유지하거나 "주간 세션 데이터" 등으로 의미 보존

라벨/UI 표기는 모두 변경, 동작/데이터 설명은 의미를 보존하면서 표현 수정.

- [ ] **Step 2: 문서 변경 검증**

Run: `grep -rn "이번 주 세션\|이번주 세션" mobile/docs mobile/.claude docs/`

라벨/UI를 가리키는 결과가 0이어야 함. 데이터 흐름 설명에 남아있는 표현은 의도적으로 유지.

---

## Task 8: 커밋 및 PR

- [ ] **Step 1: stage 및 commit**

```bash
git add mobile/src/shared/i18n/locales/ko.json \
        mobile/src/shared/i18n/locales/en.json \
        mobile/src/shared/ui/Card.tsx \
        mobile/src/features/view-summary/ui/WeeklySessionList.tsx \
        mobile/src/features/view-summary/ui/SummaryCardRenderer.tsx \
        mobile/src/features/view-summary/model/useSummaryCardData.ts \
        mobile/docs/ \
        mobile/.claude/ \
        mobile/src/features/README.md \
        docs/

git commit -m "$(cat <<'EOF'
feat(summary): 이번 주 세션 카드를 분할 루틴 타이틀 + 진행 배지로 변경

"주" 함축을 제거하고 사이클 진행 위치를 한눈에 표현하도록 카드 헤더에 N/M 배지를 추가했다.
EOF
)"
```

- [ ] **Step 2: PR 생성 (사용자 요청 시에만)**

```bash
gh pr create --title "feat(summary): 분할 루틴 카드 타이틀 + 진행 배지" --body "$(cat <<'EOF'
## Summary
- "이번 주 세션" → "분할 루틴" 타이틀 변경 (ko/en i18n)
- `Card.Header`에 `badge` prop 추가
- 우측에 `현재 / 총` 진행 배지 표시 (`useWeeklyRoutinePlan` progress 활용)
- 관련 문서 표기 일치화

## Test plan
- [ ] 메인 화면에서 카드 타이틀과 배지가 의도한 대로 표시
- [ ] 루틴 OFF 상태에서 배지 숨김
- [ ] 다크모드 가독성
- [ ] 영어 로케일 표시 확인

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Rollback 계획

문제 발생 시 i18n 두 줄과 컴포넌트 prop만 되돌리면 즉시 원복 가능 (DB 변경 없음, 안전한 변경):

```bash
git revert <커밋 hash>
```
