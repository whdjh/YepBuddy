# Supabase 테이블명 단수형 통일 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supabase 테이블 3개(`proteins`, `protein_flavors`, `protein_prices_daily`)를 SQLD/한국 DB 모델링 컨벤션에 맞춰 단수형으로 일괄 rename하고, mobile/worker 클라이언트 코드와 문서를 동기화한다.

**Architecture:** 테이블 rename은 반드시 **DB → 코드 → 배포** 순으로 atomic하게 진행. DB rename 후 코드가 옛 이름을 쓰면 prod 앱이 즉시 깨지므로, DB 작업과 클라이언트 배포 사이의 시간 갭을 최소화한다. 두 클라이언트(mobile RN, worker Node)를 동시에 PR에 묶고, RPC/View/FK 등 의존성을 사전에 점검한다.

**Tech Stack:**
- Supabase (PostgreSQL) - 테이블, RPC, RLS, FK
- React Native (Expo) + TypeScript - mobile 클라이언트
- Node.js - worker 크롤러

---

## Rename 매핑

| 현재 테이블명 | 변경 후 |
|--------------|--------|
| `proteins` | `protein` |
| `protein_flavors` | `protein_flavor` |
| `protein_prices_daily` | `protein_price_daily` |

**컬럼명은 변경하지 않는다.** (`protein_id`, `flavor_id` 등은 이미 단수형)

**JS 식별자는 변경하지 않는다.** (`fetchProteins` 함수명, `proteins` 변수명, `view-proteins` 폴더명 등은 영어 변수의 자연스러운 복수형이므로 그대로 유지)

---

## 영향받는 파일 목록

**코드 (필수 수정):**
- `mobile/src/entities/protein/api/proteinApi.ts` - 3곳 (`.from()` 호출)
- `worker/lib/coupangTracker.js` - 2곳 (`.from()` 호출)

**문서 (정확성 유지):**
- `mobile/src/entities/README.md` - table 리스트 215~218줄

**Supabase Dashboard에서 점검 필요:**
- RPC 함수 본문: `get_latest_protein_prices`, `get_protein_price_history` (함수 SQL 안에서 옛 테이블명을 참조하는지)
- View, Foreign Key, RLS Policy, Trigger
- `protein_prices_daily` upsert의 `onConflict` 제약조건 이름 (PG는 보통 자동 rename)

---

## Task 1: 사전 점검 — Supabase 의존성 전수조사

**Goal:** rename 시 깨질 수 있는 모든 의존성을 미리 파악한다.

**Files:**
- Modify: 없음 (조사만)

- [ ] **Step 1: Supabase Dashboard → Database → Tables에서 3개 테이블 확인**

각 테이블에 대해 아래 항목을 캡처/메모:
- Foreign Key constraints (양방향)
- Indexes
- RLS Policies (SELECT/INSERT/UPDATE/DELETE 각각)
- Triggers

- [ ] **Step 2: RPC 함수 본문 점검**

Supabase Dashboard → Database → Functions에서 다음 함수의 SQL을 확인:
- `get_latest_protein_prices`
- `get_protein_price_history`

함수 본문에서 `proteins`, `protein_prices_daily` 등 옛 테이블명이 등장하는지 검색. 등장하면 Task 4에서 함수 본문도 함께 업데이트해야 함.

- [ ] **Step 3: Views 점검**

Supabase Dashboard → Database → Views에서 위 3개 테이블을 참조하는 View가 있는지 확인. 있으면 View 정의도 rename 후 함께 갱신해야 함.

- [ ] **Step 4: 점검 결과 정리**

Task 4 작업 직전에 참고할 수 있도록 의존성 목록을 메모(또는 PR 설명 초안에 기록):
```
- FK: <테이블>.<컬럼> → <대상 테이블>.<컬럼>  (몇 개)
- RLS Policy: <개수>개, qualifying 절에 테이블명 직접 참조 여부
- Trigger: <개수>개
- RPC 본문 참조: get_latest_protein_prices (참조 O/X), get_protein_price_history (참조 O/X)
- View: <개수>개
```

---

## Task 2: Mobile 코드 — `proteinApi.ts` 수정

**Files:**
- Modify: `mobile/src/entities/protein/api/proteinApi.ts:84`
- Modify: `mobile/src/entities/protein/api/proteinApi.ts:104`
- Modify: `mobile/src/entities/protein/api/proteinApi.ts:202`

- [ ] **Step 1: `.from("proteins")` 2곳을 `.from("protein")`으로 변경**

Line 84:
```ts
  let query = supabase
    .from("protein")
    .select("*")
    .order("created_at", { ascending: false })
```

Line 104:
```ts
  const { data, error } = await supabase
    .from("protein")
    .select("*")
    .eq("protein_id", proteinId)
    .single()
```

- [ ] **Step 2: `.from("protein_flavors")`를 `.from("protein_flavor")`로 변경**

Line 202:
```ts
  const { data, error } = await supabase
    .from("protein_flavor")
    .select("flavor_id, name, tier, polarizing, note")
    .eq("protein_id", proteinId)
```

- [ ] **Step 3: 타입 체크**

Run: `cd mobile && bunx tsc --noEmit`
Expected: 에러 없음 (테이블명은 string literal이라 타입 영향 없음, 단 Supabase 타입 자동생성을 쓴다면 Database 타입 재생성 필요)

- [ ] **Step 4: grep으로 누락 검증**

Run: `grep -rn "protein_flavors\|\.from(\"proteins\")" mobile/src`
Expected: 결과 없음

---

## Task 3: Worker 코드 — `coupangTracker.js` 수정

**Files:**
- Modify: `worker/lib/coupangTracker.js:108`
- Modify: `worker/lib/coupangTracker.js:127`

- [ ] **Step 1: `.from('protein_prices_daily')` 2곳을 `.from('protein_price_daily')`로 변경**

Line 108:
```js
    const { data, error } = await supabase
      .from('protein_price_daily')
      .upsert([insertData], {
        onConflict: 'protein_id,observed_date',
        ignoreDuplicates: false
      })
      .select();
```

Line 127:
```js
        const { data: updateData, error: updateError } = await supabase
          .from('protein_price_daily')
          .update(updateData_obj)
          .eq('protein_id', proteinId)
          .eq('observed_date', todayStr)
          .select();
```

- [ ] **Step 2: grep으로 누락 검증**

Run: `grep -rn "protein_prices_daily" worker/`
Expected: 결과 없음

---

## Task 4: Supabase DB rename 실행

**전제:** Task 1 점검 완료, Task 2/3 코드 수정 완료(아직 머지 전).

**Files:**
- Modify: Supabase Dashboard (직접 SQL 실행 또는 Table Editor 사용)

- [ ] **Step 1: 백업 확인**

Supabase Dashboard → Database → Backups에서 최근 백업 시점 확인. 없거나 오래됐다면 수동 스냅샷 생성. (Supabase Pro 이상에서만 가능; Free tier라면 데이터 export로 대체)

- [ ] **Step 2: 테이블 rename SQL 실행**

Supabase Dashboard → SQL Editor에서 트랜잭션으로 일괄 실행:
```sql
BEGIN;

ALTER TABLE proteins RENAME TO protein;
ALTER TABLE protein_flavors RENAME TO protein_flavor;
ALTER TABLE protein_prices_daily RENAME TO protein_price_daily;

COMMIT;
```

PostgreSQL은 `ALTER TABLE RENAME` 시 FK, Index, RLS Policy 참조를 자동으로 새 이름에 따라가도록 갱신한다.

- [ ] **Step 3: RPC 함수 본문 업데이트 (Task 1에서 참조 O로 확인된 경우만)**

Supabase Dashboard → Database → Functions에서 함수 정의를 열고, 본문 안의 옛 테이블명을 새 이름으로 교체 후 저장.

예시 (실제 본문은 다를 수 있음):
```sql
-- get_protein_price_history 안에서
FROM protein_prices_daily  -- 옛
FROM protein_price_daily   -- 새
```

- [ ] **Step 4: View 정의 업데이트 (Task 1에서 발견된 경우만)**

각 View를 `CREATE OR REPLACE VIEW`로 재정의 (옛 테이블명 → 새 이름).

- [ ] **Step 5: rename 검증**

SQL Editor에서:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('protein', 'protein_flavor', 'protein_price_daily',
                     'proteins', 'protein_flavors', 'protein_prices_daily');
```
Expected: 새 이름 3개만 나와야 함. 옛 이름이 하나라도 나오면 rename 실패.

- [ ] **Step 6: RPC 동작 검증**

SQL Editor에서:
```sql
SELECT * FROM get_latest_protein_prices() LIMIT 1;
SELECT * FROM get_protein_price_history(1, 5);  -- 실제 존재하는 protein_id로
```
Expected: 결과 반환 또는 빈 결과 (에러 없음). 에러가 나면 함수 본문이 옛 이름을 아직 참조하는 것.

---

## Task 5: 통합 검증 — Mobile 앱 + Worker

**Files:**
- 수정 없음 (실행 검증만)

- [ ] **Step 1: Mobile 앱 실행 후 프로틴 화면 검증**

Run: `cd mobile && bun start`

체크 항목:
- 프로틴 탭 진입 → 목록 로드 (network에서 `/rest/v1/protein?...` 호출 확인)
- 프로틴 상세 진입 → 상세 정보 + 맛 정보 로드
- 가격 차트 표시 (RPC 호출)

콘솔에서 `404` 또는 `relation does not exist` 에러가 없어야 함.

- [ ] **Step 2: Worker 실행 검증**

Run: `cd worker && node <엔트리 스크립트>` (또는 평소 사용하는 실행 명령)

체크 항목:
- 쿠팡에서 가격 크롤링 후 `protein_price_daily` 테이블에 upsert 성공
- 콘솔에 `Supabase upsert 실패` 메시지 없음

- [ ] **Step 3: Supabase Dashboard에서 신규 row 확인**

Table Editor에서 `protein_price_daily` 최신 row의 `created_at` 또는 `observed_date`가 방금 worker 실행 시점인지 확인.

---

## Task 6: 문서 업데이트

**Files:**
- Modify: `mobile/src/entities/README.md:216-217`

- [ ] **Step 1: README의 table 리스트 갱신**

```markdown
- table `protein`
- table `protein_flavor`
- RPC `get_latest_protein_prices`
```

(가격 테이블이 README에 명시돼 있지 않다면 그대로 두고, 명시돼 있다면 `protein_price_daily`로 갱신)

- [ ] **Step 2: 다른 docs/README 점검**

Run: `grep -rn "protein_flavors\|protein_prices_daily" docs/ mobile/.claude/ worker/`
Expected: 결과 없음. 있으면 모두 새 이름으로 갱신.

---

## Task 7: PR 생성 및 머지

- [ ] **Step 1: 변경사항 stage 및 commit**

```bash
git add mobile/src/entities/protein/api/proteinApi.ts \
        worker/lib/coupangTracker.js \
        mobile/src/entities/README.md \
        docs/superpowers/plans/2026-05-10-rename-tables-singular.md

git commit -m "$(cat <<'EOF'
refactor(db): Supabase 테이블명 단수형 통일

protein, protein_flavor, protein_price_daily로 rename. 모델링 컨벤션(단수형)에 맞춰 일관성 확보.
EOF
)"
```

- [ ] **Step 2: PR 생성 (사용자 요청 시에만)**

```bash
gh pr create --title "refactor(db): Supabase 테이블명 단수형 통일" --body "$(cat <<'EOF'
## Summary
- `proteins` → `protein`, `protein_flavors` → `protein_flavor`, `protein_prices_daily` → `protein_price_daily` rename
- mobile `proteinApi.ts`, worker `coupangTracker.js` 동기화
- Supabase 측 rename은 머지 직전 별도 진행 (계획서 Task 4 참조)

## Test plan
- [ ] DB rename 후 mobile 프로틴 목록/상세 정상 로드
- [ ] worker 가격 upsert 성공
- [ ] RPC `get_latest_protein_prices`, `get_protein_price_history` 정상 동작

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: 배포 동기화**

DB rename(Task 4)과 코드 머지/배포 사이 시간 갭을 최소화한다. 권장 순서:
1. PR 리뷰 완료, 머지 직전 상태 대기
2. Supabase에서 Task 4 실행
3. 즉시 PR 머지 + mobile/worker 배포

순서를 어기면 prod 앱이 일시적으로 깨질 수 있다.

---

## Rollback 계획

DB rename 후 문제 발생 시:

```sql
BEGIN;
ALTER TABLE protein RENAME TO proteins;
ALTER TABLE protein_flavor RENAME TO protein_flavors;
ALTER TABLE protein_price_daily RENAME TO protein_prices_daily;
COMMIT;
```

코드는 PR을 revert. RPC/View 본문도 함께 되돌릴 것.
