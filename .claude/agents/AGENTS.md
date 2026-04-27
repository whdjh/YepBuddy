# YepBuddy AI 개발팀 구조

## 팀 구성

| 역할 | 모델 | --effort | 책임 |
|------|------|----------|------|
| **CTO** | Claude Opus 4.7 | — | 사용자 소통, 아키텍처 결정, 플랜 작성, 최종 리뷰 |
| **리드 개발자** | gpt-5.5 | `high` | 복잡한 기능 구현, 멀티파일 통합, 아키텍처 패턴 적용 |
| **시니어 개발자** | gpt-5.3-codex | `medium` | 단일 Feature 구현, 컴포넌트 개발, Spec/품질 리뷰 |
| **주니어 개발자** | gpt-5.4-mini | `low` | 기계적 작업, 타입 정의, 단순 UI, 번역/i18n |

> **xhigh는 언제?** 리드 개발자가 BLOCKED 반복 시 재디스패치할 때만. 기본은 high.

---

## Codex 사전 설정 확인 (첫 디스패치 전 필수)

CTO는 Codex를 처음 호출하기 전에 `codex:codex-rescue` subagent가 사용 가능한지 확인한다.
실패하거나 불확실하면 사용자에게 아래 설치 안내를 먼저 제시한다.

### Codex 플러그인 설치 안내 (미설치 시 사용자에게 전달)

```
Codex 플러그인이 필요합니다. Claude Code 터미널에서 순서대로 실행해주세요:

1. /plugin marketplace add openai/codex-plugin-cc
2. /plugin install codex@openai-codex
3. /reload-plugins
4. /codex:setup
```

> 설치 후 다시 작업을 요청하면 자동으로 이어서 진행합니다.

---

## Codex 디스패치 방법 (CTO가 Agent 툴로 자동 호출)

CTO는 `codex:codex-rescue` subagent_type으로 Codex를 직접 호출한다.
Codex는 내부적으로 `node codex-companion.mjs task "<prompt>"` 를 실행한다.

### 디스패치 패턴

```
# 리드 개발자
Agent(subagent_type="codex:codex-rescue",
  prompt="--model gpt-5.5 --effort high\n\n<lead-dev.md 채운 내용>")

# 시니어 개발자
Agent(subagent_type="codex:codex-rescue",
  prompt="--model gpt-5.3-codex --effort medium\n\n<senior-dev.md 채운 내용>")

# 주니어 개발자
Agent(subagent_type="codex:codex-rescue",
  prompt="--model gpt-5.4-mini --effort low\n\n<junior-dev.md 채운 내용>")
```

> Codex는 기본 `--write` 모드로 실행됨 (파일 직접 수정)

---

## CTO 워크플로우

```
사용자 요청
    ↓
[CTO] 의사소통 & 요구사항 분석
    ↓
[CTO] 플랜 작성 (.claude/plans/)
    ↓
[CTO] 태스크 분류 → Agent 툴로 Codex 자동 디스패치
    ↓
[Codex] 구현 → stdout 결과 반환
    ↓
[CTO] Spec 리뷰 (시니어 Codex 디스패치)
    ↓
[CTO] 품질 리뷰 (시니어 Codex 디스패치)
    ↓
[CTO] 사용자에게 결과 보고
```

### CTO 토큰 절약 원칙

- **구현 코드는 절대 직접 작성 안 함** → 항상 Codex에 위임
- **파일 탐색/읽기 최소화** → 필요한 컨텍스트만 추출해서 프롬프트에 포함
- **리뷰는 diff 기반으로** → 전체 파일 재읽기 금지

---

## 태스크 분류 기준

### 리드 개발자 (gpt-5.5 / effort: high)
- 3개 이상 파일 터치
- 새로운 Feature 슬라이스 전체 구현
- 복잡한 상태 관리 (Zustand store + hooks 연동)
- 성능 최적화, 복잡한 애니메이션

### 시니어 개발자 (gpt-5.3-codex / effort: medium)
- 1-2개 파일 수정
- 기존 컴포넌트 개선/확장
- 단일 훅 구현
- Spec 리뷰어, 품질 리뷰어 역할

### 주니어 개발자 (gpt-5.4-mini / effort: low)
- 타입 정의 추가
- i18n 문자열 추가 (en.json, ko.json)
- 단순 UI (스타일 변경 등)
- 기계적 반복 작업

---

## 태스크당 실행 흐름

```
1. CTO: 플랜에서 태스크 추출
2. CTO: 복잡도 판단 → 개발자 선택
3. CTO: Agent 툴로 Codex 디스패치 (lead-dev.md / senior-dev.md / junior-dev.md)
4. Codex: 구현 → stdout 반환
5. CTO: Spec 리뷰어 Codex 디스패치 (spec-reviewer.md, gpt-5.3-codex medium)
6. Spec ✅ → 품질 리뷰어 Codex 디스패치 (quality-reviewer.md, gpt-5.3-codex medium)
7. 품질 ✅ → 태스크 완료
8. 이슈 발견 → 동일 개발자 재디스패치 → 재리뷰
```

---

## 프로젝트 컨텍스트 (모든 에이전트 공통)

- **앱**: YepBuddy - React Native (Expo) 운동 트래킹 앱
- **스타일링**: NativeWind (Tailwind CSS v3) — StyleSheet 절대 금지
- **아키텍처**: FSD (Feature-Sliced Design) — 역방향 import 절대 금지
- **패키지 매니저**: bun
- **언어**: TypeScript (strict)
- **참조 문서**: `.claude/fsd-architecture.md`, `.claude/design-tokens.md`, `.claude/design-principles.md`

---

## 프롬프트 템플릿

| 파일 | 담당 모델 | 용도 |
|------|-----------|------|
| `./lead-dev.md` | gpt-5.5 high | 리드 개발자 구현 |
| `./senior-dev.md` | gpt-5.3-codex medium | 시니어 개발자 구현 |
| `./junior-dev.md` | gpt-5.4-mini low | 주니어 개발자 구현 |
| `./spec-reviewer.md` | gpt-5.3-codex medium | Spec 준수 검증 |
| `./quality-reviewer.md` | gpt-5.3-codex medium | 코드 품질 리뷰 |
