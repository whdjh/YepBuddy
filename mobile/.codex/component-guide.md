# YepBuddy 컴포넌트 가이드

공용 컴포넌트는 이미 구현되어 있다. 이 문서는 새로 만들 순서가 아니라 기존 구현을 찾고 안전하게 조합하는 안내다. 상세 기준은 `src/shared/README.md`, 실제 props와 플랫폼별 동작은 `src/shared/ui/*.tsx`를 확인한다.

## 기존 컴포넌트부터 확인

| 용도 | 구현 파일 | 확인할 계약 |
| --- | --- | --- |
| 화면 컨테이너 | `src/shared/ui/Main.tsx` | 배경과 상단 safe-area padding. 하단 여백은 화면에서 확인 |
| 버튼 | `src/shared/ui/Button.tsx` | `primary`, `accent`, `outline`, `ghost`, `danger`, `glass`; `label`, `onPress` |
| 카드 | `src/shared/ui/Card.tsx`, `Card.android.tsx` | `default`, `subtle`, `glass`; `Card.*` 조합과 플랫폼 차이 |
| 상태 배지 | `src/shared/ui/Badge.tsx` | `level: low/mid/high`, `label`; semantic status 색상 |
| 선택 칩/필터 | `src/shared/ui/Chip.tsx` | `Chip`, `FilterPill` export; `variant`로 상태 표현 |
| 아이콘 버튼 | `src/shared/ui/IconButton.tsx` | `back-square`, `back-round`, `adjust`, `glass`, `edit`; 접근성 라벨 |
| 아이콘 컨테이너 | `src/shared/ui/IconBox.tsx` | `size: sm/md/lg/xl`, children |
| 여러 줄 입력 | `src/shared/ui/GlassTextarea.tsx` | `value` 또는 `defaultValue`, `onChangeText`, `editable`, `minHeight` |
| 숫자 증감 | `src/shared/ui/Stepper.tsx` | `value`, `min/max`, 증감 콜백, 선택적 jump controls |
| 원형 진행률 | `src/shared/ui/RingProgress.tsx` | 숫자 `size`, `strokeWidth`, `progress`, 중앙 `children` |
| 통계 카드 | `src/shared/ui/StatCard.tsx` | 라벨, 선택적 부제, 값·단위의 카드 조합 |
| 공용 아이콘 | `src/shared/ui/SymbolView.tsx` | iOS symbol과 Android 표시 방식 |
| 글래스 표면 | `src/shared/ui/GlassSurface.tsx`, `GlassBackground.tsx`, `GlassCircleBackground.tsx` | 지원 여부와 투명도 감소 설정에 따른 fallback |

표는 탐색용이다. props를 추측해서 추가하거나 예전에 계획한 `Input`, `Textarea`, `NumberInput`, `PillNav`, `CalendarCell`, `BottomDrawer`가 현재 shared export라고 가정하지 않는다. 운동 drawer는 `src/features/do-workout/ui/WorkoutDrawer.tsx`, 탭 구성은 `src/app/(tabs)/_layout.tsx`처럼 해당 사용처도 검색한다.

## Import와 조합

공용 UI는 파일 경로로 import한다. `shared/ui/index.ts`와 `shared/index.ts`를 생성하는 절차는 없다.

```tsx
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Chip } from '@/shared/ui/Chip';
import { RingProgress } from '@/shared/ui/RingProgress';

// 화면 컴포넌트 안에서 사용. 문구와 handler는 호출부에서 전달한다.
<Button variant="accent" label={startLabel} onPress={onStart} />
<Chip variant={selected ? 'active' : 'default'} label={label} onPress={onSelect} />
<RingProgress size={90} strokeWidth={10} progress={progress} />

<Card variant="glass">
  <Card.Header label={title} />
  <Card.Metric value={value} unit={unit} />
</Card>
```

- iOS `Card.*`는 SwiftUI 부품이므로 `Card variant="glass"` 내부에서 조합한다. 일반 RN `View`에 직접 넣지 않는다.
- Android에서는 같은 import가 `Card.android.tsx`로 해석된다. 공용 API 변경 시 두 구현을 함께 확인한다.
- `RingProgress`의 `size`는 숫자다. `size="calendar"` 등의 문자열 preset이나 `label` prop은 현재 API가 아니다.
- 화면에서만 의미 있는 상태와 동작은 feature에 두고, 공용 UI는 필요한 값과 콜백을 받는다. 새 공용 API는 실제 사용처가 요구하는 범위로 제한한다.

## 스타일과 접근성

- 일반 RN UI는 NativeWind `className`과 `yb-*` 토큰을 우선 사용한다. 상세 기준과 실제 색상값이 필요한 경우는 `.codex/design-tokens.md`를 따른다.
- 글래스는 기존 공용 wrapper를 사용해 지원되지 않는 기기와 투명도 감소 설정에서도 내용이 표시되게 한다.
- 아이콘만 있는 버튼은 호출부에서 번역된 `accessibilityLabel`을 전달한다. disabled, selected 등 상태도 해당 UI에 맞게 확인한다.
- 작은 아이콘의 표시 크기와 터치 영역을 구분한다. 새 UI는 최소 44×44 논리 단위의 터치 영역을 확보한다.
- 문자열은 기존 `src/shared/i18n/locales/ko.json`, `en.json`과 화면의 번역 사용 방식을 확인한다.

## 변경 절차

1. 컴포넌트 정의와 실제 소비자를 찾아 현재 props, 플랫폼 분기, 스타일 계약을 읽는다.
2. 기존 컴포넌트로 표현할 수 있는지 판단한 뒤 필요한 변경만 한다. 도메인 전용 부품은 entity/feature에 둔다.
3. 영향받는 화면에서 레이아웃, light/dark 테마, 터치와 disabled 상태를 확인한다. 네이티브 전용 렌더링은 웹 확인만으로 검증했다고 보고하지 않는다.
4. 실행한 검사와 남은 검증 범위를 보고한다. 문서 예시를 확인하려고 임시 route를 제품에 남기지 않는다.
