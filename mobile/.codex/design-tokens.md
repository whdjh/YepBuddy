# YepBuddy Design Token 가이드

토큰의 의미를 파악한 뒤 실제 적용 경로를 확인한다. JSON, Tailwind 설정, CSS 변수, 컴포넌트는 자동으로 같은 상태가 되는 구조가 아니므로 한 파일만 보고 런타임 값을 단정하지 않는다.

## 토큰 구조와 적용 경로

```text
L1 Primitive   순수 값 (색상, 폰트, 간격, 크기)
     ↓
L2 Semantic    용도와 테마 매핑 (bg, fg, accent, status)
     ↓
L3 Component   컴포넌트별 토큰 조합
```

| 파일 | 역할 |
| --- | --- |
| `src/tokens/primitive.json` | L1 원천 값 |
| `src/tokens/semantic.json` | L2 설계: light/dark, 타이포그래피, 레이아웃 |
| `src/tokens/component.json` | L3 설계: 컴포넌트별 조합 |
| `tailwind.config.js` | 실제 NativeWind 클래스 이름과 값 매핑 |
| `src/global.css` | 런타임 light/dark 및 운동 화면 CSS 변수 |
| `src/shared/lib/designTokens.ts` | primitive export, semantic/status/card 색상과 fallback |
| `src/shared/hooks/useResolvedColorToken.ts`, `useCardColors.ts` | 네이티브 prop에 전달할 실제 색상 문자열 |

값이 다르면 설계 의도와 현재 동작의 차이를 명시하고 작업 범위에서 해결한다. 현재 화면을 오래된 JSON 값에 자동으로 맞추지 않는다. props와 기본 스타일은 `src/shared/ui` 구현과 `src/shared/README.md`를 확인한다.

## 테마와 색상

앱 테마는 `src/app/_layout.tsx`에서 시스템 색상 모드에 따라 루트에 `dark` 클래스를 적용한다. `src/global.css`의 `:root`와 `.dark`가 동일한 `yb-*` 클래스의 색상을 결정한다.

카운트다운과 운동 중 화면은 `workout-mode` 클래스를 사용한다. 운동 화면 전용 override는 현재 `.dark .workout-mode`에 정의되어 있다. 이 화면들을 항상 다크 테마라고 가정하거나 색상값을 하드코딩하지 않는다.

| 용도 | 클래스 예 |
| --- | --- |
| 배경과 표면 | `bg-yb-bg`, `bg-yb-surface`, `bg-yb-surface-muted` |
| 텍스트 | `text-yb-fg`, `text-yb-fg-secondary`, `text-yb-fg-disabled` |
| 강조 배경/텍스트 | `bg-yb-accent` + `text-yb-on-accent` |
| 강한 채움/텍스트 | `bg-yb-fill-strong` + `text-yb-on-strong` |
| 위험 액션 | `bg-yb-status-error` + `text-yb-on-danger` |
| 성공 상태 | `bg-yb-status-success-bg` + `text-yb-status-success-text` |
| 테두리 | `border-yb-border`, `border-yb-glass-border` |
| 운동 drawer | `bg-yb-drawer-bg`, `text-yb-drawer-fg` |

상태 색상은 `success-50`, `error-500` 같은 primitive 클래스를 직접 조합하기보다 `yb-status-*`를 사용해 light/dark 전환을 유지한다. 기존 `Badge`, `Button`을 쓸 수 있으면 색상 분기를 다시 구현하지 않는다.

## className과 네이티브 값

- 일반 RN UI의 정적 스타일은 NativeWind `className`과 기존 토큰을 우선한다.
- safe-area, 측정된 크기, 애니메이션, SwiftUI/Skia/SVG 또는 className을 받지 않는 네이티브 경계는 필요한 `style`, `StyleSheet`, modifier/prop을 사용할 수 있다. 이유와 적용 범위가 코드에서 드러나게 한다.
- `placeholderTextColor`, SVG stroke, SwiftUI 색상처럼 실제 색상 문자열이 필요한 prop에는 `var(--yb-*)`를 그대로 넘기지 않는다. `useResolvedColorToken()` 또는 `useCardColors()`를 사용한다.
- 앱 소스에서 `primitive.json` 직접 import는 `src/shared/lib/designTokens.ts`에 모은다. 호출부는 `primitiveColors`, `primitiveSpacing`, `appAccentColor` 등 기존 export를 사용한다.

```tsx
import { TextInput } from 'react-native';
import { useCardColors } from '@/shared/hooks/useCardColors';

function ExampleInput() {
  const { fgDisabled, accent } = useCardColors();

  return (
    <TextInput
      className="h-yb-input rounded-yb-lg bg-yb-surface border-yb-input border-yb-border px-yb-4 text-yb-fg text-yb-body-md"
      placeholderTextColor={fgDisabled}
      selectionColor={accent}
    />
  );
}
```

SVG 색상은 현재 `RingProgress.tsx`처럼 `useResolvedColorToken(semanticColorTokens.ringTrack)` 형태로 구한다. 단일 고정 accent가 필요한 외부 API는 `appAccentColor`를 사용할 수 있다.

## 레이아웃 기본값

수치는 React Native의 논리 단위 기준이다. Tailwind 설정에는 `px`로 표현된다. 화면 기능서나 해당 컴포넌트에 구체적인 값이 있으면 함께 확인한다.

| 용도 | 기본값 | 클래스 |
| --- | --- | --- |
| 화면 좌우 패딩 | 20 | `px-yb-5` |
| 카드 내부 패딩 | 24 | `p-yb-6` |
| 내부 그룹 패딩 | 16 | `p-yb-4` |
| 섹션 간격 | 24 | `gap-yb-6` |
| 그리드 간격 | 16 | `gap-yb-4` |
| 컴포넌트 간격 | 12 | `gap-yb-3` |
| 최소 터치 높이 | 44 | `min-h-yb-touch` |
| 기본/작은 버튼 높이 | 52/44 | `h-yb-btn-md`, `h-yb-btn-sm` |
| 카드/버튼 라디우스 | 16/14 | `rounded-yb-xl`, `rounded-yb-lg` |
| 입력 테두리 | 1.5 | `border-yb-input` |

공용 컴포넌트의 variant마다 패딩과 라디우스가 다를 수 있다. 예를 들어 현재 `Card`의 subtle variant는 `rounded-yb-md`를 사용한다. 모든 중첩 카드에 2:1 라디우스 비율을 강제하지 않는다.

## 변경 확인

1. 기존 토큰과 컴포넌트로 표현 가능한지 검색한다. 새 토큰은 실제 반복 용도나 테마 의미가 있을 때 추가한다.
2. 토큰을 바꾸면 JSON 설계, Tailwind 매핑, CSS 변수, 네이티브 fallback 중 영향받는 경로를 함께 점검한다.
3. light/dark, 해당되는 운동 화면 override, 글래스 fallback에서 읽기 가능한지 확인한다. 색상 문자열이 필요한 네이티브 prop도 따로 확인한다.
