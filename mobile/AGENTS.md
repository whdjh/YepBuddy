# yepbuddy

운동 트래킹 앱. React Native (Expo) + NativeWind (Tailwind CSS v3).

## 기술 스택

- **Runtime**: React Native (Expo)
- **Styling**: NativeWind + Tailwind CSS v3
- **Package Manager**: bun
- **Language**: TypeScript

## 프로젝트 구조 (FSD)

```
src/
├── app/              # Expo Router 화면 + Provider + 전역 설정
├── features/         # 사용자 행동 (동사: start-workout, log-set)
├── entities/         # 도메인 데이터 (명사: workout, exercise, protein)
├── shared/           # 범용 유틸리티
│   ├── ui/           # Button, Input, Modal 등 디자인 시스템
│   ├── lib/          # 유틸 함수
│   └── hooks/        # 범용 훅
├── tokens/           # 디자인 토큰 JSON (L1/L2/L3)
│   ├── primitive.json
│   ├── semantic.json
│   └── component.json
└── global.css        # Tailwind 지시문 + CSS 변수 (Light/Dark)
```

의존성 방향: `app → features → entities → shared` (역방향 import 금지)

## 핵심 규칙

- **FSD 아키텍처**: 같은 Layer끼리 import 금지, 각 Slice는 `index.ts`로 공개 (`.codex/fsd-architecture.md` 참조)
- 모든 스타일링은 NativeWind className으로 작성 (StyleSheet 사용 금지)
- 디자인 토큰은 `src/tokens/` 참조, Tailwind 설정은 `tailwind.config.js`
- 다크모드는 CSS 변수 기반 자동 전환 (`var(--yb-*)`)

## 문서/도구 규칙

- 라이브러리, 프레임워크, SDK, API, CLI, 클라우드 서비스 사용법을 확인할 때는 Context7 MCP로 최신 공식 문서를 먼저 조회한다.
- 일반 리팩터링, 비즈니스 로직 디버깅, 코드 리뷰, 범용 프로그래밍 개념에는 Context7을 사용하지 않는다.
- `src/entities/**` 수정 전 `src/entities/README.md`를 먼저 읽는다.
- `src/features/**` 수정 전 `src/features/README.md`를 먼저 읽는다.
- `src/shared/**` 수정 전 `src/shared/README.md`를 먼저 읽는다.
- 화면 동작, 라우팅, 사용자 흐름을 바꾸는 작업은 관련 `docs/page/*.md`를 먼저 확인한다.
- `docs/page/*.md`가 화면 기능서의 canonical source이며, 같은 이름의 `.html`은 사람이 보기 위한 산출물이다.
- md/html 내용이 충돌하면 항상 md를 기준으로 판단한다.
- HTML 안에만 존재하는 스펙, 코드 갭, 제약사항을 만들지 않는다. 새 정보는 먼저 md에 반영한다.

## 참조 문서

| 문서        | 경로                              | 내용                                 |
| ----------- | --------------------------------- | ------------------------------------ |
| 앱 명세서   | `.codex/app-spec.md`          | 전체 기능 명세 (3개 메뉴, 기술 스택) |
| FSD 가이드  | `.codex/fsd-architecture.md`  | 폴더 구조 및 의존성 규칙             |
| 디자인 토큰 | `.codex/design-tokens.md`     | 컴포넌트별 className 사용법          |
| 디자인 원칙 | `.codex/design-principles.md` | 여백, 터치 영역, 그리드 시스템 원칙  |
| Entities 가이드 | `src/entities/README.md` | 도메인 데이터, side effect, 저장소/API 경계 |
| Features 가이드 | `src/features/README.md` | 화면 흐름, 라우팅, 화면 전용 상태 |
| Shared 가이드 | `src/shared/README.md` | 공용 UI, 훅, 유틸, 디자인 토큰 |
| 화면 기능서 | `docs/page/*.md` | 화면별 사용자 흐름, 현재 동작, 제약 |
