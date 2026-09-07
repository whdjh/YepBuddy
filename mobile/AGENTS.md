# YepBuddy 작업 지침

운동 트래킹 앱. React Native + Expo Router, NativeWind + Tailwind CSS v3, TypeScript strict, 패키지 매니저는 bun이다. 버전과 실행 명령은 `package.json`을 확인한다. 아래 경로와 명령의 기준 디렉터리는 `mobile/`이다.

## 작업 방식

- 요청한 결과와 완료 조건을 파악하고, 필요한 탐색·구현·검증까지 이어서 수행한다. 계획이나 가능 여부만 답하고 멈추지 않는다.
- 관련 코드와 문서로 해결할 수 있는 선택은 직접 판단한다. 되돌릴 수 있는 구현 선택은 합리적인 가정을 짧게 알리고 진행한다. 결과를 크게 바꾸는 요구사항이 비어 있으면 해당 부분만 질문하고 독립적인 작업은 계속한다.
- 사용자 지시와 세션의 권한 정책이 우선한다. 이미 승인된 작업은 다시 묻지 않는다. 패키지 설치나 문서 조회라는 이유만으로 별도 승인 절차를 만들지 않으며, 실제 권한 제한은 도구의 승인 절차를 따른다.
- 기존 사용자 변경을 보존하고, 요청과 관계없는 리팩터링·의존성 교체·설정 변경을 섞지 않는다.
- 진행 중에는 발견한 사실과 다음 확인 사항을 짧게 공유한다. 최종 보고는 변경 결과, 검증 결과, 남은 제약을 중심으로 간결하게 작성한다.

## 문서 선택과 우선순위

필요한 문서부터 읽고, 호출 관계나 변경 범위가 넓어질 때 추가로 읽는다. 모든 참조 문서를 매번 한꺼번에 읽지 않는다.

| 작업 대상 | 먼저 확인할 문서/소스 |
| --- | --- |
| 앱 개요와 진입점 | `.codex/app-spec.md` |
| 레이어 경계와 import | `.codex/fsd-architecture.md` |
| 도메인 데이터·저장소·외부 연동 | `src/entities/README.md` |
| 화면 흐름·라우팅·화면 상태 | `src/features/README.md`, 관련 `docs/page/*.md` |
| 공용 UI·훅·유틸 | `src/shared/README.md` |
| UI 구성·토큰·레이아웃 | `.codex/component-guide.md`, `.codex/design-tokens.md`, `.codex/design-principles.md` |
| 네이티브 모듈·Live Activity·config plugin | `plugins/README.md` |
| 서브에이전트 분배·리뷰 | `.codex/agents/AGENTS.md`와 필요한 역할 템플릿 |

- 각 레이어를 수정하기 전에 해당 README를 읽는다. 화면 동작을 바꾸기 전에 관련 화면 기능서를 읽는다.
- `docs/page/*.md`가 화면 기능서의 기준이며, 같은 이름의 `.html`은 사람 열람용 산출물이다. 새 스펙·제약·코드 차이는 먼저 md에 반영한다.
- `.codex/app-spec.md`는 개요와 탐색 지도다. 세부 화면 동작은 `docs/page/*.md`, 레이어 계약은 각 README, 실제 구현 여부는 코드와 실행 결과로 확인한다.
- 문서와 코드가 다르면 의도된 동작과 현재 동작을 구분한다. 오래된 설명에 맞추려고 기능을 임의로 바꾸지 않는다. 요청과 관련된 차이는 근거를 확인해 함께 정리한다.
- 라이브러리·프레임워크·SDK·API·CLI·클라우드 서비스 사용법은 Context7 MCP에서 `resolve-library-id` → `query-docs` 순서로 조회한다. 정확한 라이브러리 ID가 제공되면 resolve는 생략한다. 설치 버전과 질문에 맞는 공식 소스를 선택한다.
- 일반 리팩터링, 비즈니스 로직 디버깅, 코드 리뷰, 범용 프로그래밍 개념에는 Context7을 사용하지 않는다. 조회 도구가 없거나 실패하면 공식 문서와 로컬 소스로 확인하고 확인하지 못한 내용은 구분한다.

## 코드 경계

```text
src/app → src/features → src/entities → src/shared
```

- 상위 레이어에서 하위 레이어로 의존한다. 중간 레이어는 건너뛸 수 있다.
- `features`/`entities`의 서로 다른 슬라이스끼리 직접 import하지 않는다. 같은 슬라이스 안에서는 상대 경로를 사용한다.
- feature/entity 외부에서는 각 슬라이스의 `index.ts`로 import한다. `shared`는 기존처럼 `@/shared/ui/Button`, `@/shared/lib/date` 등 파일 경로를 사용한다.
- 라우팅과 화면 흐름은 `app`/`features`, 도메인 상태·저장소·외부 연동은 `entities`, 도메인 없는 공용 코드는 `shared`에 둔다.
- 기존 저장 키·저장 포맷·알림 식별자·네이티브 이벤트/payload 계약을 보존한다. 변경 요청이 있으면 기존 데이터와 호출부에 대한 호환 처리를 함께 검토한다.
- 타입 오류를 숨기는 `any`나 넓은 타입 단언을 추가하지 않는다. 외부·저장소·네이티브 경계에서 값을 검증하고, 불가피한 타입 보정은 좁은 범위로 제한한다.

## UI 규칙

- 일반 React Native UI는 NativeWind `className`과 `yb-*` 토큰을 우선 사용한다.
- SwiftUI modifier, Skia/SVG, 네이티브 전용 prop, 측정값·애니메이션처럼 클래스만으로 표현하기 어려운 부분은 기존 `style`/modifier 패턴을 따른다. 일반 정적 스타일을 불필요하게 `StyleSheet`로 옮기지 않는다.
- 실제 색상 문자열이 필요한 API에는 `useResolvedColorToken()`이나 `useCardColors()`를 사용한다. `var(--yb-*)` 문자열을 그대로 네이티브 색상 prop에 넘기지 않는다.
- 앱 소스에서 `primitive.json`은 `src/shared/lib/designTokens.ts`에서만 직접 읽는다. 토큰 클래스는 `tailwind.config.js`, 테마 값은 `src/global.css`, 토큰 원본은 `src/tokens/`에서 확인한다.
- `flex-1` 등의 크기 지정은 부모 크기와 스크롤·네이티브 Host 경계에 맞춰 판단한다. 무조건 추가하거나 제거하지 않는다.
- 플랫폼별 구현(`*.android.tsx` 등), light/dark 테마, 아이콘 버튼의 `accessibilityLabel`을 변경 범위에 맞춰 확인한다.

## 서브에이전트

- 일반 작업 지시는 서브에이전트 사용을 허용한다. 독립적인 탐색·구현·리뷰를 병렬로 수행해 시간이나 품질을 개선할 수 있으면 위임한다.
- 메인 에이전트는 요구사항 판단, 바로 다음 단계에 필요한 작업, 통합과 최종 검증을 맡는다. 위임한 동안에는 독립적으로 진행할 일을 수행한다.
- 파일 개수나 직급으로 모델·추론 수준을 고정하지 않는다. 역할 이름은 작업 책임을 나타내며, 기본적으로 현재 세션의 모델·추론 설정을 상속한다. 별도 모델 정책은 명시적인 사용자 지시나 세션 설정을 따른다.
- 위임할 때 목표, 완료 조건, 소유 파일, 필요한 문서, 검증 범위를 전달한다. 병렬 구현의 수정 파일은 겹치지 않게 나눈다.
- 작은 수정이나 순차 의존성이 강한 작업은 직접 처리한다. 스펙 리뷰와 품질 리뷰는 필요하면 같은 구현을 병렬로 검토할 수 있으며, 모든 작업에 두 단계 승인을 강제하지 않는다.
- 메인 에이전트가 결과와 diff를 확인하고 필요한 수정을 통합한 뒤 완료를 판단한다.

## 검증과 완료

현재 검증 명령은 다음과 같다. `mobile/`에서 실행하며, 스크립트 변경 여부는 `package.json`과 `scripts/`를 먼저 확인한다.

| 변경 범위 | 검증 |
| --- | --- |
| TypeScript/TSX | `bunx tsc --noEmit --pretty false`, `bun run lint` |
| Workout config plugin | `node scripts/check_workout_session_plugin.cjs` |
| Live Activity/widget | `node scripts/check_dynamic_island_widget.js` |
| 문서만 수정 | 참조 경로·명령·규칙 간 일관성 확인, `git diff --check` |

- 현재 `typecheck`/`test`/`build` package script는 없다. 존재하지 않는 `bun run typecheck` 등을 실행 명령으로 가정하지 않는다.
- 변경 동작을 확인할 수 있는 가장 좁은 검증부터 실행한다. 버그 수정은 가능하면 재현 조건을 확인하고 회귀를 검증한다. 작은 문서·스타일 변경을 위해 형식적인 테스트를 만들지 않는다.
- 새 실패·추가 수정·해결하지 못한 위험이 있을 때 검증을 넓히거나 반복한다. 통과한 검증을 이유 없이 반복하지 않는다.
- 네이티브 정적 계약 검사는 기기 동작이나 빌드 성공을 보장하지 않는다. 관련 변경에서 실행하지 못한 플랫폼/기기 검증은 보고한다.
- 완료 전 요청 충족 여부와 diff를 확인한다. 실행한 검증의 성공·실패, 기존 실패와 새 실패, 미실행 항목을 구분한다.
