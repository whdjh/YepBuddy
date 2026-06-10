# YepBuddy Codex 작업 구조

## 기본 원칙

- Codex가 사용자 소통, 요구사항 분석, 구현, 검증, 최종 보고를 직접 수행한다.
- `AGENTS.md`를 최상위 지침으로 삼고, 세부 문서는 `.codex/` 아래 문서를 참조한다.
- 큰 작업은 먼저 범위를 나누고, 작은 작업은 바로 수정한다.
- 구현 후 가능한 검증 명령을 실행하고, 실행하지 못한 검증은 최종 보고에 명시한다.
- 기존 사용자 변경사항은 되돌리지 않는다.

---

## 역할 템플릿

아래 역할 파일은 긴 작업을 나눠서 생각하거나 별도 Codex 세션/서브에이전트에 전달할 때 쓰는 프롬프트 템플릿이다. 현재 Codex가 직접 처리할 수 있는 작업은 굳이 디스패치하지 않는다.

| 역할 | 권장 effort | 책임 |
|------|-------------|------|
| **리드 개발자** | `high` | 복잡한 기능 구현, 멀티파일 통합, 아키텍처 패턴 적용 |
| **시니어 개발자** | `medium` | 단일 Feature 구현, 컴포넌트 개발, Spec/품질 리뷰 |
| **주니어 개발자** | `low` | 기계적 작업, 타입 정의, 단순 UI, 번역/i18n |

---

## Codex 워크플로우

```
사용자 요청
    ↓
[Codex] 요구사항 분석
    ↓
[Codex] 필요한 경우 플랜 작성
    ↓
[Codex] 태스크 분류 및 구현
    ↓
[Codex] 타입체크/테스트/빌드 등 검증
    ↓
[Codex] Spec 자체 리뷰
    ↓
[Codex] 품질 자체 리뷰
    ↓
[Codex] 사용자에게 결과 보고
```

### 작업 원칙

- 관련 파일을 먼저 읽고 기존 패턴을 따른다.
- `src/entities/**`는 `src/entities/README.md`, `src/features/**`는 `src/features/README.md`, `src/shared/**`는 `src/shared/README.md`를 먼저 확인한다.
- 화면 동작, 라우팅, 사용자 흐름을 바꾸는 작업은 관련 `docs/page/*.md`를 먼저 확인한다.
- `docs/page/*.md`가 화면 기능서의 canonical source이고, 같은 이름의 `.html`은 사람 열람용 산출물이다.
- 불필요한 리팩터링과 메타데이터 변경은 피한다.
- 리뷰는 diff 중심으로 하되, 동작 이해에 필요한 주변 코드는 확인한다.
- 새 패키지 설치나 외부 네트워크가 필요하면 사용자 승인을 받는다.

---

## 태스크 분류 기준

### 리드 개발자 (effort: high)
- 3개 이상 파일 터치
- 새로운 Feature 슬라이스 전체 구현
- 복잡한 상태 관리 (Zustand store + hooks 연동)
- 성능 최적화, 복잡한 애니메이션

### 시니어 개발자 (effort: medium)
- 1-2개 파일 수정
- 기존 컴포넌트 개선/확장
- 단일 훅 구현
- Spec 리뷰어, 품질 리뷰어 역할

### 주니어 개발자 (effort: low)
- 타입 정의 추가
- i18n 문자열 추가 (en.json, ko.json)
- 단순 UI (스타일 변경 등)
- 기계적 반복 작업

---

## 태스크당 실행 흐름

```
1. 요청과 관련 문서를 확인한다.
2. 복잡도를 판단하고 필요한 경우 작업을 작은 단계로 나눈다.
3. 구현한다.
4. `bun run typecheck` 등 가능한 검증을 실행한다.
5. Spec 리뷰 기준으로 누락/초과 구현을 확인한다.
6. 품질 리뷰 기준으로 타입 안전성, FSD, NativeWind 규칙을 확인한다.
7. 이슈가 있으면 수정 후 재검증한다.
8. 변경 요약과 검증 결과를 보고한다.
```

---

## 프로젝트 컨텍스트 (모든 에이전트 공통)

- **앱**: YepBuddy - React Native (Expo) 운동 트래킹 앱
- **스타일링**: NativeWind (Tailwind CSS v3) — StyleSheet 절대 금지
- **아키텍처**: FSD (Feature-Sliced Design) — 역방향 import 절대 금지
- **패키지 매니저**: bun
- **언어**: TypeScript (strict)
- **참조 문서**: `.codex/fsd-architecture.md`, `.codex/design-tokens.md`, `.codex/design-principles.md`

---

## 프롬프트 템플릿

| 파일 | 권장 effort | 용도 |
|------|-----------|------|
| `./lead-dev.md` | high | 리드 개발자 구현 |
| `./senior-dev.md` | medium | 시니어 개발자 구현 |
| `./junior-dev.md` | low | 주니어 개발자 구현 |
| `./spec-reviewer.md` | medium | Spec 준수 검증 |
| `./quality-reviewer.md` | medium | 코드 품질 리뷰 |
