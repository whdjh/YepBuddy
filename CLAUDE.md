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

- **FSD 아키텍처**: 같은 Layer끼리 import 금지, 각 Slice는 `index.ts`로 공개 (`.claude/fsd-architecture.md` 참조)
- 모든 스타일링은 NativeWind className으로 작성 (StyleSheet 사용 금지)
- 디자인 토큰은 `src/tokens/` 참조, Tailwind 설정은 `tailwind.config.js`
- 다크모드는 CSS 변수 기반 자동 전환 (`var(--yb-*)`)

## 참조 문서

| 문서 | 경로 | 내용 |
|------|------|------|
| 앱 명세서 | `.claude/app-spec.md` | 전체 기능 명세 (3개 메뉴, 기술 스택) |
| FSD 가이드 | `.claude/fsd-architecture.md` | 폴더 구조 및 의존성 규칙 |
| 디자인 토큰 | `.claude/design-tokens.md` | 컴포넌트별 className 사용법 |
| 디자인 원칙 | `.claude/design-principles.md` | 여백, 터치 영역, 그리드 시스템 원칙 |
