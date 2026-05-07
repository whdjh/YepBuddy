# Shared Guide

`mobile/src/shared`는  앱 전체에서 같이 쓰는 UI, 훅, 유틸, 다국어 리소스를 모아둔 곳입니다. 

```
shared/
├── hooks/   공용 React 훅
├── i18n/    i18next 설정과 ko/en 번역 파일
├── lib/     날짜, 포맷, 링크, 알림 같은 공용 로직
└── ui/      버튼, 카드, 글래스 표면 같은 공용 UI
```

## 기본 원칙

- 색상, 크기, 간격은 `yb-*` 토큰을 먼저 씁니다. 없는 값이 반복되면 `tailwind.config.js`와 `global.css`에 토큰을 추가합니다.
- `IconButton`, `Pressable`처럼 아이콘만 보이는 버튼은 호출부에서 `accessibilityLabel`을 넘깁니다.
- 글래스 UI는 `GlassSurface`, `GlassBackground`, `GlassCircleBackground`를 통해서만 만듭니다.
- 외부 URL은 `openWebUrl()` 또는 `getSafeWebUrl()`로 검증한 뒤 엽니다.
- 날짜/시간 유틸은 잘못된 값이 들어와도 `NaN`이 화면이나 저장 키로 퍼지지 않게 처리합니다.
- `Card.*` 서브 컴포넌트는 SwiftUI 기반입니다. 일반 RN `View` 안에 바로 흩뿌리지 말고 `Card variant="glass"` 안에서 씁니다.

## Design Tokens

주요 토큰 위치:

- `mobile/tailwind.config.js`: Tailwind/NativeWind 클래스 토큰
- `mobile/src/global.css`: light/dark CSS 변수
- `mobile/src/tokens/*.json`: 토큰 원본 문서

자주 쓰는 컴포넌트 크기:

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `h-yb-touch` | 44px | 최소 터치 높이 |
| `h-yb-btn-md` | 52px | 기본 버튼 |
| `h-yb-badge` | 28px | 상태 배지 |
| `h-yb-chip` | 44px | Chip |
| `h-yb-icon-btn`, `w-yb-icon-btn` | 44px | 아이콘 버튼 |
| `h-yb-icon-sm/md/lg`, `w-yb-icon-sm/md/lg` | 44/48/56px | 아이콘 박스 |
| `h-yb-icon-box-xl`, `w-yb-icon-box-xl` | 80px | 큰 아이콘 박스 |

주요 색상 토큰:

| 토큰 | 용도 |
| --- | --- |
| `text-yb-fg`, `text-yb-fg-secondary`, `text-yb-fg-disabled` | 일반 텍스트 |
| `bg-yb-surface`, `bg-yb-surface-muted`, `bg-yb-fill-pale` | 표면/채움 |
| `text-yb-on-accent`, `text-yb-on-strong`, `text-yb-on-danger` | 강한 배경 위 텍스트 |
| `border-yb-border`, `border-yb-glass-border` | 기본/글래스 border |
| `bg-yb-status-*`, `text-yb-status-*` | 성공/정보/에러 상태 |

## Glass

`GlassSurface`는 다음 구조로 렌더링됩니다.

```
View(border/radius)
└── GlassBackground
    ├── GlassView              Liquid Glass 사용 가능
    └── View(bg-yb-surface/95) 미지원 또는 투명도 감소 설정
└── content View
```

기본값:

| 항목 | 기본값 |
| --- | --- |
| `cornerRadius` | 16 |
| `paddingSize` | 0 |
| `fallbackClassName` | `bg-yb-surface/95` |
| border | `border border-yb-glass-border` |

`Card variant="glass"`는 `cornerRadius=16`, `paddingSize=24`를 기본값으로 씁니다. 특정 화면에서 더 작은 패딩이 필요하면 호출부에서 명시적으로 넘깁니다.

## UI Components

### Button

렌더링:

- `variant="glass"`: `GlassSurface + Pressable + Text`
- 나머지 variant: `Pressable + Text`

주요 사용처:

- `ProteinDetailScreen`
- `TempoScreen`
- `TempoModeButtons`

가이드:

- 위험 액션은 `variant="danger"`를 쓰고, 텍스트는 `text-yb-on-danger` 토큰을 사용합니다.
- 외부에서 `className`을 넘기면 기본 스타일 뒤에 붙습니다.

### IconButton

렌더링:

- `back-square`, `glass`: `GlassSurface + Pressable + View`
- `back-round`, `adjust`, `edit`: `Pressable`

주요 사용처:

| 사용처 | 라벨 |
| --- | --- |
| `ResultScreen` | `t("common.back")` |
| `SettingsScreen` | `t("settings.back")` |
| `CalendarScreen` | `t("common.back")` |
| `ProteinDetailScreen` | `t("common.back")` |
| `SessionListScreen` | `t("common.back")` |
| `TempoScreen` | `t("common.back")` |
| `EditableSummaryCardFrame` | `t("common.delete")` |

가이드:

- 아이콘만 있는 버튼이라 호출부에서 `accessibilityLabel`을 꼭 넘깁니다.

### GlassTextarea

렌더링:

- `GlassTextarea`: `GlassSurface + TextInput multiline`

주요 사용처:

- `GlassTextarea`: `ResultScreen`, `MemoSection`

가이드:

- `placeholderTextColor`는 `useCardColors().fgDisabled`처럼 실제 색상 문자열을 넘깁니다.
- placeholder 색상을 `placeholder:text-*` 클래스만으로 처리하지 않습니다.

### Stepper

렌더링:

- `default`: `View + Pressable/Text`
- `glass`: `GlassSurface + View + Pressable/Text`

주요 사용처:

- `SetCountList`
- `TempoSettings`

가이드:

- plus/minus 버튼은 `h-yb-icon-btn w-yb-icon-btn`을 기준으로 맞춥니다.
- 큰 점프 조절이 필요한 경우 `jumpStep`을 넘깁니다.

### Badge

렌더링:

- `View + Text`

주요 사용처:

- `ProteinDetailScreen`

가이드:

- 높이는 `h-yb-badge`를 씁니다.
- 상태 색상은 `status-success/info/error` 토큰을 씁니다.

### Chip / FilterPill

렌더링:

- 일반 variant: `Pressable + Text`
- `glass`: `GlassSurface + Pressable + Text`

주요 사용처:

| 컴포넌트 | 사용처 |
| --- | --- |
| `Chip` | `BodyPartSelector` |
| `FilterPill` | `ProteinListScreen`, `FilterTabs` |

가이드:

- 외부 `className`은 내부 기본 크기/정렬 뒤에 붙습니다.

### Card / StatCard

렌더링:

- `Card default/subtle`: RN `View`
- `Card glass`: `GlassSurface + Host + SwiftUI VStack`
- `Card.*`: SwiftUI `HStack`, `VStack`, `Text`, `Image`, `Spacer`, `Divider`
- `StatCard`: `Pressable + Card`

주요 사용처:

- `ProteinCard`
- `ProteinDetailScreen`
- `SessionHeader`
- `TodayWorkoutCard`
- `WorkoutLinkCard`
- `SessionLinkCard`
- `WeeklySessionList`
- `SessionCard`
- `StatsGrid`
- `SummaryCardRenderer`

가이드:

- `StatCard`는 글래스 카드만 사용합니다.
- SwiftUI modifier가 필요한 값은 `useCardColors()`로 실제 색상을 꺼내 씁니다.

### RingProgress

렌더링:

- `View + Svg + Circle(track/fill) + absolute child View`

주요 사용처:

- `TempoRingDisplay`

가이드:

- 기본 track/fill 색상은 `--yb-ring-track`, `--yb-ring-fill`에서 읽습니다.
- 특정 화면만 다른 색이 필요할 때만 `trackColor`, `fillColor`를 넘깁니다.
- `progress`는 내부에서 0~1로 맞춥니다.
- `style`은 병합하되, `size`로 정한 width/height가 마지막에 적용됩니다.

### BodyPartIcon / BodyPartIconHost

렌더링:

- `BodyPartIcon`: RN `View`, PNG `Image`, fallback `SymbolView`
- `BodyPartIconHost`: SwiftUI 카드 내부에 RN 아이콘을 넣기 위한 bridge

주요 사용처:

- `BodyPartBadge`
- `SessionHeader`
- `TodayWorkoutCard`
- `WeeklySessionList`
- `SessionLinkCard`
- `SessionCard`

### Layout / 기타

| 컴포넌트 | 렌더링 | 사용처 |
| --- | --- | --- |
| `Main` | safe-area top padding이 있는 full-screen `View` | 대부분의 화면 |
| `SettingsFab` | absolute `View + GlassSurface + Pressable + SymbolView` | 탭 화면 |
| `IconBox` | `View` wrapper | `CountdownScreen` |
| `GlassCircleBackground` | `GlassView` 또는 fallback `View` | `SummaryEditControls` |

## Hooks

### useCardColors

NativeWind CSS 변수를 실제 색상 문자열로 읽어옵니다. SwiftUI, Skia, SVG, `placeholderTextColor`, `tintColor`처럼 className이 먹지 않는 곳에서 씁니다.

반환값:

```ts
{
  fg,
  fgSecondary,
  fgDisabled,
  accent,
  fillPale,
  glassTint,
}
```

주요 사용처:

- `Card`
- `GlassTextarea`
- `Button`
- `BodyPartIcon`
- `HeartRateChart`
- `PriceTrendChart`

### useDebouncedEffect

의존성이 바뀐 뒤 지정한 시간 동안 추가 변경이 없으면 effect를 한 번 실행합니다.

```ts
useDebouncedEffect(
  () => {
    saveDraft(value)
  },
  400,
  [value],
)
```

주요 사용처:

- `WorkoutContext`
- `useWorkoutPersistence`

## Lib

### date.ts

| Export | 반환 | 용도 |
| --- | --- | --- |
| `getFirstDayOfWeek(year, month)` | `number` | 월요일=0, 일요일=6 기준 첫 요일 |
| `getDaysInMonth(year, month)` | `number` | 해당 월의 일수 |
| `getLocalDateKeyFromIso(iso)` | `string` | ISO를 `YYYY-MM-DD` 로컬 날짜 키로 변환. 잘못된 값이면 `""` |
| `getLocalDateKey(date)` | `string` | Date를 날짜 키로 변환. 잘못된 값이면 `""` |
| `getUtcMsFromDateKey(dateKey)` | `number \| null` | 날짜 키를 UTC timestamp로 변환 |
| `getElapsedWeeksBetweenDateKeys(start, end)` | `number` | 두 날짜 키 사이의 지난 전체 주 수 |
| `getThisWeekDateRange()` | `{ startDateKey, endDateKey }` | 이번 주 월요일~일요일 |
| `getDateAfterHours(iso, hours)` | `Date \| null` | ISO 기준 N시간 뒤 |
| `getIsoAfterHours(iso, hours)` | `string` | ISO 기준 N시간 뒤 ISO. 잘못된 값이면 `""` |
| `getTimeDistanceMs(a, b)` | `number` | 두 ISO 사이 거리. 잘못된 값이면 큰 값 |
| `getTimestampMsFromIso(iso)` | `number \| null` | ISO timestamp |

주요 사용처:

- 캘린더: `MonthGrid`, `useMonthWorkoutDates`
- 세션 저장: `sessionStorage`
- 요약: `useTodaySummary`, `useTodayCompleted`
- 주간 루틴: `weeklyRoutineCycle`
- HealthKit 매칭: `healthKit`

### format.ts

| Export | 반환 | 용도 |
| --- | --- | --- |
| `formatDateWithDay(date)` | `string` | `MM.DD 요일` |
| `formatMonthYear(date)` | `string` | i18n 월 헤더 |
| `bodyPartLabel(key)` | `string` | 운동 부위 라벨 |
| `bodyPartDetailLabel(key)` | `string` | 세부 부위 라벨 |
| `formatDuration(seconds)` | `string` | `H:MM:SS` |
| `formatElapsedMs(ms)` | `string` | `MM:SS.CC` |
| `formatTime(iso)` | `string` | `H:MM` |

잘못된 Date는 빈 문자열을 반환합니다. 숫자 포맷은 잘못된 값이나 음수가 들어오면 0 기준으로 표시합니다.

### legalLinks.ts

| Export | 용도 |
| --- | --- |
| `getSafeWebUrl(value)` | `http://`, `https://` URL만 통과 |
| `openWebUrl(value)` | URL 검증 후 열기. 실패하면 `false` |
| `privacyPolicyUrl` | expo config의 개인정보 처리방침 URL |
| `supportUrl` | expo config의 지원 URL |

주요 사용처:

- `SummaryScreen`
- `ProteinDetailScreen`

### group.ts

`groupByMonth<T extends { date: Date }>(items)`는 날짜가 있는 목록을 월별 `Map`으로 묶습니다.

주요 사용처:

- `SessionListScreen`

### skiaChartPaths.ts

| Export | 용도 |
| --- | --- |
| `buildLinePath(points)` | Skia 선 경로 |
| `buildAreaPath(points, y0)` | Skia 영역 경로 |

주요 사용처:

- `HeartRateChart`
- `PriceTrendChart`

### notificationPermissionRequest.tsx

주간 루틴 안내 모달과 알림 권한 요청 타이밍을 맞추기 위한 Context입니다.

| Export | 용도 |
| --- | --- |
| `NotificationPermissionRequestProvider` | 루트에서 상태 제공 |
| `useNotificationPermissionRequestDone` | 안내 모달 표시 가능 여부 확인 |

## Protein Sale Notification

프로틴 세일 알림은 `shared/lib/protein-sale-notification` 아래에 있습니다.

| 파일 | 역할 |
| --- | --- |
| `events.ts` | 세일 일정과 알림 예정일 계산 |
| `scheduler.ts` | 권한 확인, 예약, 취소, 앱 시작 동기화 |
| `storage.ts` | 알림 ON/OFF와 예약 ID 저장 |
| `permissions.ts` | iOS 알림 권한 확인/요청 |
| `handler.ts` | 알림 탭 처리와 `/protein` 이동 |
| `index.ts` | 외부 공개 API |

공개 API:

| Export | 사용처 | 사이드 이펙트 |
| --- | --- | --- |
| `setupProteinSaleNotificationHandler` | `app/_layout.tsx` | 알림 응답 리스너 등록 |
| `syncProteinSaleNotificationsIfEnabled` | `app/_layout.tsx` | enabled 상태면 권한 팝업 없이 재예약 |
| `scheduleProteinSaleNotifications` | `ProteinSaleNotificationToggle` | 권한 요청/확인, 기존 예약 취소, 미래 알림 예약 |
| `disableProteinSaleNotifications` | `ProteinSaleNotificationToggle` | enabled=false 저장, 예약 취소 |
| `getProteinSaleNotificationEnabled` | toggle, scheduler | 저장된 ON/OFF 조회 |

`scheduler.ts`는 알림 작업이 겹쳐 들어와도 앞 작업이 끝난 뒤 다음 작업을 처리합니다. 새 예약 중 실패하면 이미 잡은 알림을 직접 취소하고, 취소에 실패한 ID는 저장소에 남겨 다음 취소 때 다시 시도할 수 있게 합니다.

## i18n

`i18n.ts`는 `expo-localization`으로 기기 언어를 읽고, 기본 언어와 fallback 언어는 `ko`로 둡니다.

번역 파일:

- `locales/ko.json`
- `locales/en.json`

최상위 키:

- `common`
- `tabs`
- `settings`
- `workoutPlaceReminder`
- `workout`
- `summary`
- `sessions`
- `calendar`
- `tempo`
- `protein`
- `legal`

사용 예:

```tsx
const { t } = useTranslation()

return <Text>{t("calendar.title")}</Text>
```

가이드:

- `ko`와 `en`은 같은 키 구조를 유지합니다.
- `{{placeholder}}` 이름도 양쪽 파일에서 맞춥니다.
- Shared 유틸에서 번역이 필요하면 `i18n.t()`를 씁니다.