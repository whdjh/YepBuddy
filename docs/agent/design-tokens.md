# yepbuddy Design Token 가이드

## 토큰 구조 (3-Layer)

```
L1 Primitive   순수 값 (cream.50, spacing.4, radius.xl)
     ↓
L2 Semantic    용도 매핑 (bg, fg, accent × light/dark)
     ↓
L3 Component   컴포넌트별 조합 (button.primary.bg, card.radius)
```

| 레이어 | 파일 | 역할 |
|--------|------|------|
| L1 | `src/tokens/primitive.json` | 테마 무관 순수 색상, 폰트, 간격, 라디우스 값 |
| L2 | `src/tokens/semantic.json` | Light/Dark 매핑 + 타이포그래피 스케일 + 레이아웃 규칙 |
| L3 | `src/tokens/component.json` | 22개 컴포넌트별 속성 조합 |

---

## 다크모드

CSS 변수 기반. 동일한 클래스명이 Light/Dark에서 자동 전환.

```tsx
import { useColorScheme } from 'nativewind';
const { colorScheme, setColorScheme } = useColorScheme();
```

CSS 변수는 `src/global.css`에 정의:
- `:root` → Light 테마
- `.dark` → Dark 테마

**다크 전용 화면(카운트다운, 활성 운동)은 항상 다크 토큰을 하드코딩.**

---

## 컴포넌트별 사용 예시

### 카드 (radius: outer 16 = inner 8 × 2)

```tsx
<View className="bg-yb-surface border-yb border-yb-border rounded-yb-xl p-yb-6 shadow-yb-sm">
  <View className="bg-yb-surface-subtle rounded-yb-sm p-yb-4">
    <Text className="text-yb-fg text-yb-body-md">내용</Text>
  </View>
</View>
```

### 버튼

```tsx
// Primary (h:52, r:14)
<Pressable className="h-yb-btn-md rounded-yb-lg bg-yb-fill-strong px-yb-6 items-center justify-center">
  <Text className="text-yb-on-strong text-yb-body-lg font-semibold">완료</Text>
</Pressable>

// Accent
<Pressable className="h-yb-btn-md rounded-yb-lg bg-yb-accent px-yb-6 items-center justify-center">
  <Text className="text-yb-on-accent text-yb-body-lg font-semibold">운동 시작</Text>
</Pressable>

// Outline
<Pressable className="h-yb-btn-md rounded-yb-lg border-yb-input border-yb-accent px-yb-6 items-center justify-center">
  <Text className="text-yb-accent text-yb-body-md font-medium">캘린더에 등록</Text>
</Pressable>

// Ghost (h:44, r:10)
<Pressable className="h-yb-btn-sm rounded-yb-md px-yb-4 items-center justify-center">
  <Text className="text-yb-fg-secondary text-yb-body-sm">취소</Text>
</Pressable>

// Danger
<Pressable className="h-yb-btn-md rounded-yb-lg bg-error-500 px-yb-6 items-center justify-center">
  <Text className="text-white text-yb-body-lg font-semibold">삭제</Text>
</Pressable>
```

### 칩

```tsx
// Default
<Pressable className="h-yb-chip rounded-yb-chip bg-yb-fill-pale border-yb-input border-yb-border px-[18px] items-center justify-center">
  <Text className="text-yb-fg text-yb-body-sm">가슴</Text>
</Pressable>

// Active
<Pressable className="h-yb-chip rounded-yb-chip bg-yb-accent border-yb-input border-yb-accent px-[18px] items-center justify-center">
  <Text className="text-yb-on-accent text-yb-body-sm">하체 ✓</Text>
</Pressable>
```

### 아이콘 박스 (border = 앱 배경색)

```tsx
<View className="w-yb-icon-sm h-[44px] rounded-yb-sm bg-success-50 border-yb-icon border-yb-bg items-center justify-center">
  <WeightIcon size={24} color="#2E5A2E" />
</View>
```

### 인풋

```tsx
<TextInput
  className="h-yb-input rounded-yb-lg bg-yb-surface border-yb-input border-yb-border px-yb-4 text-yb-fg text-yb-body-md font-yb"
  placeholderTextColor="var(--yb-fg-disabled)"
/>
```

### 넘버 인풋

```tsx
<Pressable className="w-yb-num-input h-yb-num-input rounded-yb-lg bg-yb-surface border-yb-input border-yb-border items-center justify-center">
  <Text className={`text-yb-num-sm ${sets > 0 ? 'text-yb-accent' : 'text-yb-fg-disabled'}`}>
    {sets || 0}
  </Text>
</Pressable>
```

### 세그먼트 토글 (outer 12 → inner 10)

```tsx
<View className="flex-row bg-yb-surface-muted rounded-yb-icon p-[4px]">
  <Pressable className={`flex-1 h-yb-touch rounded-yb-md items-center justify-center ${
    active ? 'bg-yb-surface shadow-yb-sm' : ''
  }`}>
    <Text className={active ? 'text-yb-fg font-semibold' : 'text-yb-fg-tertiary'}>탭</Text>
  </Pressable>
</View>
```

### 뱃지

```tsx
<View className="px-yb-3 py-[4px] rounded-full bg-success-50">
  <Text className="text-success-700 text-yb-caption font-semibold">저점</Text>
</View>
```

### 알약 네비게이션 (항상 expanded)

```tsx
<View className="flex-row gap-yb-1.5 bg-yb-fill-strong rounded-full p-yb-2.5 min-h-yb-touch shadow-yb-lg">
  {tabs.map(tab => (
    <Pressable
      key={tab.key}
      className={`flex-1 items-center gap-[3px] rounded-yb-chip py-yb-2.5 px-yb-3.5 ${
        active === tab.key ? 'bg-yb-accent' : ''
      }`}
    >
      <Text className="text-[18px]">{tab.icon}</Text>
      <Text className="text-yb-on-strong text-yb-caption">{tab.label}</Text>
    </Pressable>
  ))}
</View>
```

### 템포 필드

```tsx
<View className="flex-row bg-yb-surface border-yb border-yb-border rounded-yb-lg p-yb-4 gap-yb-3.5 items-center justify-center">
  <Pressable className="w-yb-touch h-yb-touch rounded-yb-md bg-yb-fill-pale border-yb border-yb-border items-center justify-center">
    <Text className="text-yb-fg text-[20px]">−</Text>
  </Pressable>
  <View className="items-center min-w-[48px]">
    <Text className="text-yb-fg-tertiary text-yb-caption">수축</Text>
    <Text className="text-yb-fg text-yb-num-sm">3<Text className="text-yb-fg-tertiary text-yb-label">초</Text></Text>
  </View>
  <Pressable className="w-yb-touch h-yb-touch rounded-yb-md bg-yb-fill-pale border-yb border-yb-border items-center justify-center">
    <Text className="text-yb-fg text-[20px]">+</Text>
  </Pressable>
</View>
```

---

## 핵심 규칙

| 규칙 | 값 |
|------|-----|
| 최소 터치 영역 | **44px** (`min-h-yb-touch`) |
| 버튼 높이 | md: **52px**, sm: **44px** |
| 카드 라디우스 | outer: **16px**, inner: **8px** (2:1) |
| 세그먼트 라디우스 | outer: **12px**, inner: **10px** |
| 화면 좌우 패딩 | **20px** (`px-yb-5`) |
| 카드 내부 패딩 | **24px** (`p-yb-6`) |
| 섹션 간격 | **24px** (`gap-yb-6` 또는 `mb-yb-6`) |
| 그리드 간격 | **16px** (`gap-yb-4`) |
| 아이콘 박스 테두리 | **1.5px**, 색상 = 앱 배경색 (`border-yb-bg`) |
| 인풋 테두리 | **1.5px** (`border-yb-input`) |

---

## 색상 대비 규칙

| 배경 | 주요 텍스트 | 보조 텍스트 | 약한 텍스트 | 강조 |
|------|-----------|-----------|-----------|------|
| Light (#FAF7F2) | `text-yb-fg` | `text-yb-fg-secondary` | `text-yb-fg-tertiary` | `text-yb-accent` |
| Dark (#1A120A) | `text-yb-fg` | `text-yb-fg-secondary` | `text-yb-fg-tertiary` | `text-yb-accent` |
