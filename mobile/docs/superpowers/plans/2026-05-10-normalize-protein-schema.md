# 프로틴 스키마 정규화 (3NF 강화) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase 프로틴 도메인 스키마를 3NF 관점에서 정리한다. ① `flavors` 마스터 테이블을 분리해 맛 이름 중복(예: 마이프로틴 WPC/WPI 모두에 "밀크티")을 제거하고, ② 의미가 모호한 컬럼명(`url`, `taste`)을 명확화한다.

**Architecture:** 데이터 마이그레이션이 포함되므로 **DB 작업 → 코드 동기화 → 배포** 순서로 atomic하게 진행. `flavors` 분리는 기존 데이터를 보존하면서 점진적으로(컬럼 추가 → 데이터 백필 → 코드 전환 → 옛 컬럼 DROP) 수행해 롤백 여유를 둔다. `proteins.url`은 worker 실패 시 fallback 역할을 하므로 유지하되 의도가 드러나는 이름으로 변경.

**Tech Stack:**
- Supabase (PostgreSQL) - 테이블/제약/마이그레이션
- React Native (Expo) + TypeScript - mobile 클라이언트
- Node.js - worker 크롤러 (이번 작업에서 worker 코드 영향 없음)

---

## 변경 매핑

**테이블 분리:**

| 현재 | 변경 후 |
|------|--------|
| `protein_flavors` (flavor_id, protein_id, **name**, tier, polarizing, note, created_at, updated_at) | `flavors` 마스터 + `protein_flavors` 변경 |

**최종 구조:**

```
flavors
  flavor_master_id  int8 PK
  name              text NOT NULL UNIQUE     -- 예: "밀크티", "초코"
  created_at        timestamptz

protein_flavors  (junction + 평가 정보)
  flavor_id          int8 PK
  protein_id         int8 FK → proteins
  flavor_master_id   int8 FK → flavors
  tier               flavor_tier
  polarizing         bool
  note               text
  created_at, updated_at
  UNIQUE(protein_id, flavor_master_id)
```

**컬럼 리네임:**

| 테이블 | 현재 | 변경 후 | 사유 |
|-------|------|--------|------|
| `proteins` | `url` | `fallback_url` | worker 실패 시 `protein_prices_daily.url` 대체 용도임을 명확화 |
| `proteins` | `taste` | `taste_description` | 자유 서술 텍스트임을 명확화 |

**변경하지 않는 것:**

- `protein_prices_daily` 스키마 — 이미 `(protein_id, observed_date)` UNIQUE 인덱스(`protein_prices_daily_uniq_per_day`) 존재 확인됨, 정규화 관점 문제 없음
- `topic` enum — 단순 분류 chip 용도, 분리 불필요 (YAGNI)
- 테이블명 단/복수 — 별도 계획서(`2026-05-10-rename-tables-singular.md`)에서 다룸

---

## 영향받는 파일 목록

**필수 수정:**
- `mobile/src/entities/protein/api/proteinApi.ts:202-238` — `fetchProteinFlavors` 쿼리에 join 추가, `flavor_master_id` 매핑
- `mobile/src/entities/protein/model/adapters.ts:81,111` — `protein.url` → `protein.fallback_url` 참조 변경
- `mobile/src/entities/protein/model/types.ts` (또는 ApiProtein 타입 정의 파일) — `url` → `fallback_url`, `taste` → `taste_description`

**Supabase Dashboard에서 직접 수행:**
- `flavors` 테이블 신규 생성
- `protein_flavors`에 `flavor_master_id` 컬럼 추가, 데이터 백필, name 컬럼 DROP
- `proteins` 컬럼 RENAME 2건

**문서 갱신:**
- `mobile/src/entities/README.md:215-218` — table 리스트, 컬럼 설명
- `mobile/.claude/app-spec.md` — 데이터 모델 섹션이 있다면 갱신

**워커:**
- `worker/lib/coupangTracker.js` — 영향 없음 (flavors/taste/url 컬럼을 직접 참조하지 않음, `protein_prices_daily.url`만 사용)

---

## Task 1: 사전 점검 — 의존성 및 타입 정의 파악

**Files:**
- Modify: 없음 (조사만)

- [ ] **Step 1: ApiProtein/ApiProteinFlavor 타입 정의 위치 확인**

Run: `grep -rn "interface ApiProtein\|type ApiProtein\|interface ApiProteinFlavor" mobile/src/entities/protein/`

찾은 파일에서 다음 필드의 타입 정의를 확인:
- `ApiProtein.url`, `ApiProtein.taste`
- `ApiProteinFlavor` 구조 (현재 name 등)

이 타입들을 Task 5에서 갱신해야 한다.

- [ ] **Step 2: `proteins.url` / `proteins.taste` 사용처 재확인**

Run: `grep -rn "protein\.url\|protein\.taste\|\.url\b" mobile/src/entities/protein mobile/src/features/view-protein-detail mobile/src/features/view-proteins`

확정 사용처:
- `mobile/src/entities/protein/model/adapters.ts:81,111` — `protein.url` fallback 패턴
- `proteins.taste` 표시 위치 (있으면 detail screen일 가능성)

- [ ] **Step 3: 현재 `flavors` 데이터 분포 확인**

Supabase SQL Editor:
```sql
SELECT name, COUNT(DISTINCT protein_id) AS protein_count
FROM protein_flavors
GROUP BY name
ORDER BY protein_count DESC;
```

같은 name이 여러 protein에 등장하는 케이스가 실제로 얼마나 있는지 데이터로 확인. 결과를 PR 설명에 첨부.

---

## Task 2: Supabase — `flavors` 마스터 테이블 생성 및 데이터 백필

**Files:**
- Modify: Supabase Dashboard SQL Editor

- [ ] **Step 1: 백업 확인**

Supabase → Database → Backups에서 최근 백업 시점 확인. 없으면 수동 export.

- [ ] **Step 2: `flavors` 테이블 생성**

```sql
CREATE TABLE flavors (
  flavor_master_id  bigserial PRIMARY KEY,
  name              text NOT NULL UNIQUE,
  created_at        timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Step 3: 기존 distinct name을 `flavors`에 INSERT**

```sql
INSERT INTO flavors (name)
SELECT DISTINCT name
FROM protein_flavors
WHERE name IS NOT NULL AND name <> ''
ORDER BY name;
```

- [ ] **Step 4: `protein_flavors`에 `flavor_master_id` 컬럼 추가 (nullable로 시작)**

```sql
ALTER TABLE protein_flavors
  ADD COLUMN flavor_master_id bigint REFERENCES flavors(flavor_master_id);
```

- [ ] **Step 5: 기존 row의 `flavor_master_id` 백필**

```sql
UPDATE protein_flavors pf
SET flavor_master_id = f.flavor_master_id
FROM flavors f
WHERE pf.name = f.name;
```

검증:
```sql
SELECT COUNT(*) AS unmapped FROM protein_flavors WHERE flavor_master_id IS NULL;
```
Expected: `0`. 0이 아니면 name이 NULL/빈 문자열인 row 존재 → 별도 처리 필요.

- [ ] **Step 6: NOT NULL + UNIQUE(protein_id, flavor_master_id) 제약 추가**

```sql
ALTER TABLE protein_flavors
  ALTER COLUMN flavor_master_id SET NOT NULL;

ALTER TABLE protein_flavors
  ADD CONSTRAINT uq_protein_flavors_protein_master
  UNIQUE (protein_id, flavor_master_id);
```

UNIQUE 제약 추가 시 중복 발견되면 데이터 정합성 문제 → 정리 후 재시도.

---

## Task 3: Supabase — `protein_flavors.name` 컬럼 DROP (코드 전환 후)

⚠️ **이 Task는 Task 5(코드 전환) 머지/배포 완료 후에 수행한다.** 코드가 아직 `name`을 참조하는 동안 DROP하면 prod 깨짐.

**Files:**
- Modify: Supabase Dashboard SQL Editor

- [ ] **Step 1: 코드에서 `protein_flavors.name` 참조가 모두 제거됐는지 확인**

Run: `grep -rn "flavor.*\.name\|protein_flavors.*name" mobile/`

`protein_flavors`에서 직접 `name`을 select하는 코드가 없는지 확인. (Task 5 이후 새 쿼리는 `flavors.name`을 join해서 가져옴)

- [ ] **Step 2: `name` 컬럼 DROP**

```sql
ALTER TABLE protein_flavors DROP COLUMN name;
```

- [ ] **Step 3: 검증**

Supabase Table Editor에서 `protein_flavors`의 컬럼 구조 확인. `name` 사라지고 `flavor_master_id`만 있어야 함.

---

## Task 4: Supabase — `proteins` 컬럼 리네임

**Files:**
- Modify: Supabase Dashboard SQL Editor

- [ ] **Step 1: 컬럼 RENAME 트랜잭션**

```sql
BEGIN;

ALTER TABLE proteins RENAME COLUMN url TO fallback_url;
ALTER TABLE proteins RENAME COLUMN taste TO taste_description;

COMMIT;
```

PG는 컬럼 RENAME 시 인덱스, FK, View 등 참조를 자동으로 새 이름으로 갱신.

- [ ] **Step 2: 검증**

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'proteins'
  AND column_name IN ('url', 'taste', 'fallback_url', 'taste_description');
```
Expected: `fallback_url`, `taste_description` 2개만. `url`, `taste`가 나오면 RENAME 실패.

- [ ] **Step 3: View/RPC 본문 점검**

Supabase → Database → Functions에서 `get_latest_protein_prices`, `get_protein_price_history` 본문에 옛 컬럼명(`proteins.url`, `proteins.taste`) 참조가 있는지 확인. 있으면 함수 정의 갱신.

---

## Task 5: Mobile 코드 — `proteinApi.ts` 쿼리 갱신

**Files:**
- Modify: `mobile/src/entities/protein/api/proteinApi.ts:194-242`

- [ ] **Step 1: `fetchProteinFlavors` 쿼리에 `flavors` join 추가**

기존:
```ts
.from("protein_flavors")
.select("flavor_id, name, tier, polarizing, note")
```

변경:
```ts
.from("protein_flavors")
.select("flavor_id, tier, polarizing, note, flavors(name)")
```

PostgREST의 nested select 문법으로 `flavors` 테이블의 `name`을 함께 가져옴. 결과 row 형태:
```ts
{ flavor_id: 1, tier: 'T1', polarizing: false, note: '...', flavors: { name: '밀크티' } }
```

- [ ] **Step 2: row 매핑 코드 갱신 (line 211-238 근처)**

```ts
return (data ?? []).flatMap((row) => {
  const flavorId = toPositiveInteger(row.flavor_id)
  const name = toNonEmptyString(row.flavors?.name)  // <- 변경
  if (flavorId == null || !name) return []

  // ... 이하 동일
})
```

`row.name` → `row.flavors?.name`으로 변경.

- [ ] **Step 3: Supabase 클라이언트 타입 재생성 (자동 생성 사용 시)**

```bash
cd mobile && bunx supabase gen types typescript --project-id <PROJECT_ID> > src/shared/lib/database.types.ts
```

(프로젝트가 자동 타입 생성을 사용하지 않으면 이 step skip)

- [ ] **Step 4: 타입 체크**

Run: `cd mobile && bunx tsc --noEmit`
Expected: 에러 없음

---

## Task 6: Mobile 코드 — `adapters.ts` 컬럼명 변경 반영

**Files:**
- Modify: `mobile/src/entities/protein/model/adapters.ts:81`
- Modify: `mobile/src/entities/protein/model/adapters.ts:111`
- Modify: `mobile/src/entities/protein/model/types.ts` (또는 ApiProtein 정의 위치)

- [ ] **Step 1: ApiProtein 타입 갱신**

Task 1 Step 1에서 찾은 타입 정의 파일에서:
```diff
 interface ApiProtein {
   protein_id: number
   title: string
-  url: string | null
-  taste: string | null
+  fallback_url: string | null
+  taste_description: string | null
   // ... 기타 필드
 }
```

- [ ] **Step 2: `adapters.ts` line 81 갱신**

```diff
-      purchaseUrl: latest?.url ?? protein.url ?? null,
+      purchaseUrl: latest?.url ?? protein.fallback_url ?? null,
```

- [ ] **Step 3: `adapters.ts` line 111 갱신**

```diff
-    purchaseUrl: latest?.url ?? protein.url ?? null,
+    purchaseUrl: latest?.url ?? protein.fallback_url ?? null,
```

- [ ] **Step 4: `taste` 사용처 갱신 (있으면)**

Run: `grep -rn "protein\.taste\|\.taste\b" mobile/src`
모든 `protein.taste` 참조를 `protein.taste_description`으로 변경.

- [ ] **Step 5: 타입 체크**

Run: `cd mobile && bunx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 6: grep으로 누락 검증**

Run: `grep -rn "\"url\"\b\|\"taste\"\b\|protein\.url\|protein\.taste\|\.from(\"protein_flavors\").*name" mobile/src/entities/protein`

이전 컬럼명을 직접 참조하는 코드가 남아있지 않은지 확인. 결과 0이어야 함.

---

## Task 7: 통합 검증

**Files:**
- 수정 없음 (실행 검증)

- [ ] **Step 1: Mobile 앱 실행**

Run: `cd mobile && bun start`

체크 항목:
- 프로틴 목록 화면 진입 → 카드들이 정상 표시 (`fallback_url` 변경 영향)
- 프로틴 상세 진입 → 맛 정보 표시 (flavors join 동작 검증)
- 맛 이름이 정상적으로 표시되는지 확인
- 구매 링크 버튼 동작 확인 (purchaseUrl이 정상 세팅되는지)

콘솔 에러 없어야 함. 특히 `relation does not exist`, `column ... does not exist` 등.

- [ ] **Step 2: Supabase REST API 직접 호출 검증 (선택)**

```bash
curl "https://<PROJECT>.supabase.co/rest/v1/protein_flavors?select=flavor_id,tier,flavors(name)&limit=3" \
  -H "apikey: <ANON_KEY>"
```
Expected: 각 row에 `flavors: { name: "..." }` 중첩 객체 포함.

- [ ] **Step 3: Worker 실행 검증**

Run: `cd worker && node <엔트리>`

worker는 이번 변경 영향 없지만 회귀 검증 차원에서 한 번 실행. `protein_prices_daily` upsert 정상 동작 확인.

---

## Task 8: 문서 갱신

**Files:**
- Modify: `mobile/src/entities/README.md:215-218`
- Modify: `mobile/.claude/app-spec.md` (해당 섹션 있을 경우)

- [ ] **Step 1: README의 table 리스트 갱신**

`mobile/src/entities/README.md`:
```markdown
- table `proteins` (컬럼: `fallback_url`, `taste_description` 등)
- table `flavors` (맛 마스터)
- table `protein_flavors` (상품-맛 junction + tier/polarizing/note)
- RPC `get_latest_protein_prices`
```

- [ ] **Step 2: 컬럼 설명 추가 (entities README에 컬럼 설명 섹션이 있다면)**

`fallback_url`, `taste_description`이 무엇이고 왜 이런 이름인지 한 줄 설명 추가:
- `fallback_url`: worker가 prices.url 수집에 실패했을 때 사용하는 대체 구매 링크
- `taste_description`: 마이프로틴 맛 평가용 자유 서술 텍스트

- [ ] **Step 3: 다른 docs/spec 점검**

Run: `grep -rn "protein_flavors.*name\|proteins\.url\|proteins\.taste" mobile/docs mobile/.claude docs/`
모두 새 명명으로 갱신.

---

## Task 9: 커밋 및 머지 동기화

- [ ] **Step 1: stage 및 commit**

```bash
git add mobile/src/entities/protein/api/proteinApi.ts \
        mobile/src/entities/protein/model/adapters.ts \
        mobile/src/entities/protein/model/types.ts \
        mobile/src/entities/README.md \
        mobile/docs/superpowers/plans/2026-05-10-normalize-protein-schema.md

git commit -m "$(cat <<'EOF'
refactor(db): 프로틴 스키마 정규화 (flavors 마스터 분리, 컬럼명 명확화)

마이프로틴 WPC/WPI에 동일 맛("밀크티")이 중복 저장되던 구조를 flavors 마스터 + junction 패턴으로 분리하고, proteins.url/taste를 의도가 드러나는 이름(fallback_url, taste_description)으로 변경했다.
EOF
)"
```

- [ ] **Step 2: 배포 동기화**

DB 작업과 코드 머지/배포 사이 시간 갭 최소화. 권장 순서:
1. PR 리뷰 완료, 머지 직전 상태 대기
2. Supabase에서 Task 2(flavors 분리, 백필) + Task 4(컬럼 RENAME) 실행
3. **즉시** PR 머지 + mobile 배포
4. 코드 배포 안정화 확인 후 Task 3(`name` 컬럼 DROP) 실행

순서를 어기면 prod에서 옛 컬럼/구조 참조로 깨질 수 있음.

---

## Rollback 계획

**Task 2/4까지만 적용된 상태(name 컬럼 살아있음):**

코드는 PR revert. DB는 별도 작업 불필요 — `name` 컬럼이 살아있어 옛 코드도 동작. `flavor_master_id` 컬럼은 nullable 상태로 두거나, 시간이 있으면:
```sql
ALTER TABLE protein_flavors DROP COLUMN flavor_master_id;
DROP TABLE flavors;
```

**Task 4 컬럼 RENAME 롤백:**
```sql
ALTER TABLE proteins RENAME COLUMN fallback_url TO url;
ALTER TABLE proteins RENAME COLUMN taste_description TO taste;
```

**Task 3 (name DROP)까지 적용된 후 롤백:**

가장 어려운 케이스. 백업에서 `name` 컬럼 복구 + 데이터 재백필 필요. **그래서 Task 3는 코드 안정화를 충분히 확인한 후에 실행할 것.**
