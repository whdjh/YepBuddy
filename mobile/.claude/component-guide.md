# yepbuddy 컴포넌트 빌딩 가이드

난이도 순서로 정리. 각 컴포넌트를 `src/shared/ui/`에 만들고, `index.ts`에 export 추가.

```
src/shared/
├── ui/
│   ├── Badge.tsx
│   ├── Card.tsx
│   ├── Button.tsx
│   ├── Chip.tsx
│   ├── IconButton.tsx
│   ├── IconBox.tsx
│   ├── Input.tsx
│   ├── Textarea.tsx
│   ├── NumberInput.tsx
│   ├── SegmentToggle.tsx
│   ├── PillNav.tsx
│   ├── RingProgress.tsx
│   ├── CalendarCell.tsx
│   ├── BottomDrawer.tsx
│   └── index.ts
└── index.ts
```

---

## Level 1: 기초 (상태 없음, props만 받아서 표시)

### 1-1. Badge

가장 단순한 컴포넌트. props 받아서 색만 다르게 표시.

- **props**: `level: "low" | "mid" | "high"`, `label: string`
- **스펙**: h:28, r:pill(full), px:12, py:4
- **색상**: low=success(green), mid=info(blue), high=error(red)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   저점    │  │   중간    │  │   고점    │
└──────────┘  └──────────┘  └──────────┘
 bg:success-50  bg:info-50    bg:error-50
 txt:success-700 txt:info-700  txt:error-700
```

**핵심 패턴**: Record로 level별 스타일 매핑

```tsx
const styles: Record<BadgeLevel, { container: string; text: string }> = {
  low:  { container: "bg-success-50", text: "text-success-700" },
  mid:  { container: "bg-info-50",    text: "text-info-700" },
  high: { container: "bg-error-50",   text: "text-error-700" },
};
```

**사용할 RN 컴포넌트**: `View`, `Text`

---

### 1-2. Card

중첩 가능한 컨테이너. variant로 outer/inner 구분.

- **props**: `variant?: "default" | "subtle"`, `children`, 나머지 ViewProps 전달
- **스펙**:
  - default(outer): bg:surface, border:1px border-color, r:16, p:24, shadow:sm
  - subtle(inner): bg:surface-subtle, r:8, p:16

```
╔═══════════════════════╗  ← default (r:16, border, shadow)
║  ┌───────────────┐    ║
║  │  subtle       │    ║  ← subtle (r:8, no border)
║  └───────────────┘    ║
╚═══════════════════════╝
```

**핵심 패턴**: className을 외부에서 추가할 수 있게 `${className ?? ""}` 처리

**사용할 RN 컴포넌트**: `View`

---

## Level 2: variant 패턴 (여러 스타일 분기)

### 2-1. Button

5가지 variant. container 스타일 + label 스타일 분리.

- **props**: `variant?: "primary" | "accent" | "outline" | "ghost" | "danger"`, `label: string`, PressableProps
- **스펙**:

| variant | h | r | bg | text color | border |
|---------|---|----|-----|-----------|--------|
| primary | 52 | 14 | fill-strong | on-strong | 없음 |
| accent  | 52 | 14 | accent | on-accent | 없음 |
| outline | 52 | 14 | transparent | accent | 1.5px accent |
| ghost   | 44 | 10 | transparent | fg-secondary | 없음 |
| danger  | 52 | 14 | error-500 | white | 없음 |

**핵심 패턴**: container용 Record + label용 Record 두 개로 분리. `active:opacity-80`로 누름 피드백.

**사용할 RN 컴포넌트**: `Pressable`, `Text`

---

### 2-2. Chip

active 토글이 있는 선택 칩.

- **props**: `label: string`, `active?: boolean`, PressableProps
- **스펙**: h:44, r:22(chip), border:1.5px, px:18
  - default: bg=fill-pale, border=border, text=fg
  - active: bg=accent, border=accent, text=on-accent

**핵심 패턴**: active에 따라 삼항 연산자로 className 분기

**사용할 RN 컴포넌트**: `Pressable`, `Text`

---

### 2-3. IconButton

아이콘을 감싸는 정사각형 버튼.

- **props**: `variant?: "back" | "adjust"`, `children: ReactNode`, PressableProps
- **스펙**:
  - back: 44x44, r:12, bg=surface-muted
  - adjust: 44x44, r:10, bg=fill-pale, border:1px

**주의**: `ReactNode`는 `react`에서 import! (`react-native` 아님)

**사용할 RN 컴포넌트**: `Pressable`

---

### 2-4. IconBox

아이콘을 감싸는 컨테이너. border 색이 앱 배경색과 동일해서 seamless blend.

- **props**: `size?: "sm" | "md" | "lg"`, `children`, ViewProps
- **스펙**:
  - sm: 44x44
  - md: 48x48
  - lg: 56x56
  - 공통: r:8, border:1.5px, border-color=bg(앱 배경색)

**사용할 RN 컴포넌트**: `View`

---

## Level 3: 상태 관리 (useState)

### 3-1. Input

focus/error 상태에 따라 border 색 변경.

- **props**: `error?: boolean`, TextInputProps 전달
- **스펙**: h:48, r:14, border:1.5px, px:16, bg:surface
  - default: border=border
  - focus: border=accent
  - error: border=error-500
  - placeholder color: #A8A29E

**핵심 패턴**: `useState`로 focus 상태 관리. `onFocus`/`onBlur`에서 toggle + 원래 핸들러 호출.

**사용할 RN 컴포넌트**: `TextInput`

---

### 3-2. Textarea

Input 확장. multiline + 높이만 다름.

- **props**: Input과 동일
- **스펙**: min-h:120, padding-y:16, multiline, textAlignVertical:"top"

**핵심 패턴**: Input 컴포넌트를 import해서 재사용. 추가 className만 전달.

---

### 3-3. NumberInput

세트수 입력용. 탭하면 키패드 오픈 (onPress 외부 처리).

- **props**: `value: number`, `editing?: boolean`, PressableProps
- **스펙**: 100x56, r:14, border:1.5px
  - empty(value=0): text=fg-disabled
  - filled(value>0): text=accent
  - editing: border=accent

**사용할 RN 컴포넌트**: `Pressable`, `Text`

---

## Level 4: 배열 기반 + 콜백 (map 렌더링)

### 4-1. SegmentToggle

2~3개 옵션을 토글하는 컨트롤.

- **props**: `options: { key: string; label: string }[]`, `activeKey: string`, `onSelect: (key: string) => void`
- **스펙**: r-outer:12, r-inner:10, h:44, padding:4px, bg:surface-muted
  - active: bg=surface, shadow=sm, text=fg font-semibold
  - inactive: text=fg-tertiary

**핵심 패턴**: `options.map()`으로 렌더링. `isActive = option.key === activeKey`

**사용할 RN 컴포넌트**: `View`, `Pressable`, `Text`

---

### 4-2. PillNav

하단 알약형 네비게이션. 항상 expanded.

- **props**: `tabs: { key: string; icon: string; label: string }[]`, `activeKey: string`, `onSelect: (key: string) => void`
- **스펙**: bg=fill-strong, r=pill(full), p:10, gap:6, min-h:44
  - active tab: bg=accent, r:22
  - label: text=on-strong, caption size
  - shadow: lg

**핵심 패턴**: SegmentToggle과 동일한 map 패턴. 차이는 세로 방향 (icon + label) + pill 모양.

**사용할 RN 컴포넌트**: `View`, `Pressable`, `Text`

---

## Level 5: SVG / 합성 컴포넌트

### 5-1. RingProgress

SVG Circle 기반 원형 프로그레스 바.

- **의존성**: `react-native-svg` (`Svg`, `Circle` import)
- **props**: `size?: "calendar" | "dashboard" | "tempo" | "countdown"`, `progress: number (0~1)`, `label?: string`
- **스펙**:

| size | diameter | stroke |
|------|----------|--------|
| calendar | 38 | 4 |
| dashboard | 90 | 10 |
| tempo | 200 | 14 |
| countdown | 240 | 16 |

**핵심 공식**:
```
radius = (diameter - stroke) / 2
circumference = 2 * Math.PI * radius
strokeDashoffset = circumference * (1 - progress)
```

**구조**:
```
View (width/height = diameter, items-center justify-center)
├── Svg (rotate -90deg)
│   ├── Circle (track: stroke=#EDE4D6)
│   └── Circle (fill: stroke=#9B7E56, dasharray/dashoffset)
└── View (absolute, label 텍스트)
```

---

### 5-2. CalendarCell

날짜 + 미니 RingProgress + 운동 dot.

- **props**: `day: number`, `progress?: number`, `isToday?: boolean`, `hasWorkout?: boolean`
- **스펙**: min-h:44, ring=38px(calendar size), dot=5px green

**구조**:
```
View (items-center, gap:4)
├── Text (날짜: today면 accent+bold, 아니면 fg-secondary)
└── View (ring 영역)
    ├── Svg (38px ring, stroke:4)
    └── View (absolute, 5px green dot — hasWorkout일 때만)
```

RingProgress를 재사용하지 않고 직접 SVG를 그리거나, RingProgress의 calendar size를 활용.

---

### 5-3. BottomDrawer

항상 dark 배경인 하단 드로어 컨테이너.

- **props**: `children`, ViewProps
- **스펙**: bg=earth-300(#3A2A1A), r-top:20, handle=khaki-300 40x5px pill
- **중요**: 다크 전용 UI → CSS 변수가 아닌 하드코딩 색상 사용

**구조**:
```
View (bg-earth-300, rounded-t-yb-drawer)
├── View (handle: 40x5, bg-khaki-300, rounded-full)
└── {children}
```

---

## 진행 방법

1. `mkdir -p src/shared/ui` 로 디렉토리 생성
2. Level 1부터 하나씩 만들기
3. 만들 때마다 `src/shared/ui/index.ts`에 export 추가
4. `src/app/index.tsx`에서 import해서 화면에 올려보고 확인
5. 다음 Level로 진행
