# shared

`mobile/src/shared`는 화면(features) 간에 공유되는 **재사용 가능한 UI, 훅, 라이브러리, 다국어 리소스**를 모아둔 디렉터리입니다.

```
shared/
├── hooks/   - 공용 React 훅
├── i18n/    - 다국어(ko/en) 설정 및 리소스
├── lib/     - 순수 유틸리티 함수와 도메인 로직(알림 등)
└── ui/      - 재사용 가능한 UI 컴포넌트
```

---

## hooks

### useCardColors

**시그니처**: `useCardColors(): { fg: string, fgSecondary: string, fgDisabled: string, accent: string, fillPale: string, glassTint: string }`

**용도**: SwiftUI 기반 카드 표면과 입력 필드가 공유하는 의미론적 색상 팔레트를 제공합니다.

**동작 방식**: NativeWind의 CSS 변수 런타임 값을 읽어 시맨틱 토큰(`--yb-fg`, `--yb-accent` 등)을 해석합니다. CSS 변수가 정의되지 않은 경우 프리미티브 토큰 폴백값을 사용하여 테마 적용을 보장합니다.

**사용 예시**:
```typescript
const { fg, accent, fillPale } = useCardColors()

return (
  <View className={`bg-[${fillPale}]`}>
    <Text className={`text-[${accent}]`}>제목</Text>
  </View>
)
```

### useDebouncedEffect

**시그니처**: `useDebouncedEffect(effect: () => void, delay: number, dependencies: readonly unknown[]): void`

**용도**: 의존성 변경 이후 지정된 지연 시간이 경과했을 때 effect를 정확히 한 번 실행합니다.

**동작 방식**: `useEffect` 내에서 `setTimeout`을 예약하고, 의존성이 변경되면 이전 타이머를 정리(`clearTimeout`)한 후 새 타이머를 설정합니다. 연속된 변경이 발생하면 마지막 변경 이후 `delay` 시간이 경과할 때까지 effect 실행을 지연합니다.

**사용 예시**:
```typescript
const [searchText, setSearchText] = useState('')

useDebouncedEffect(
  () => {
    console.log('검색:', searchText)
    // API 호출
  },
  500,
  [searchText]
)
```

---

## i18n

### 설정 (i18n.ts)

Yepbuddy 모바일 앱은 **i18next** 라이브러리와 React 연동을 위한 **react-i18next** 패키지를 사용합니다. 언어 감지는 `expo-localization`의 `getLocales()` 함수로 기기의 시스템 언어를 자동 감지하며, 감지 실패 시 기본값은 `"ko"`(한국어)입니다. Fallback 언어도 `"ko"`로 설정되어 한국어 번역이 없는 문자열에 자동 대체됩니다. 초기화는 i18next 인스턴스를 생성한 후 `init()` 메서드로 리소스(ko/en), 언어, 폴백, 보간 설정을 구성하며, HTML 이스케이프는 `false`로 설정되어 특수문자 처리가 필요한 경우 지원합니다.

### Locales 구조

**최상위 키**:
- `common` - 뒤로, 취소, 저장, 확인 등 모든 화면에서 공통으로 사용되는 UI 텍스트
- `tabs` - 하단 탭 네비게이션 (일지, 템포, 프로틴)
- `settings` - 설정 화면의 제목, 섹션, 루틴/리마인더 옵션 설명
- `workoutPlaceReminder` - 운동 장소 도착 알림과 프롬프트 텍스트
- `workout` - 운동 기록, 카운트다운, 캘린더 추가, 진행 중, 결과, 신체 부위, 주간 루틴 관련 모든 텍스트
- `summary` - 운동일지 화면의 카드 제목, 단위, 편집 관련 텍스트
- `sessions` - 세션 필터, 월 헤더 포맷
- `calendar` - 캘린더 화면 제목
- `tempo` - 템포 트레이닝 화면의 수축/이완, 대기, 카운트 관련 텍스트
- `protein` - 프로틴 제품 필터, 가격, 상세정보, 마이프로틴 세일 알림 이벤트명
- `legal` - 개인정보 처리방침, 문의, 푸터 레이블

### En/Ko 구조 일치성

영어와 한국어 파일은 완전히 동일한 구조를 유지합니다. 양쪽 모두 최상위 11개 카테고리와 동일한 계층 구조를 가지며, 특히 `workout` 섹션은 하위 13개의 중첩된 도메인(`record`, `countdown`, `calendar`, `reminder`, `active`, `result`, `bodyParts`, `weeklyRoutine`, `bodyPartDetails` 등)으로 구성되어 있습니다. 모든 동적 텍스트는 `{{placeholder}}` 형식의 보간을 사용하여 런타임 값 삽입을 지원합니다.

### 사용 패턴

컴포넌트에서는 `react-i18next`의 `useTranslation()` 훅으로 번역 함수 `t`를 얻고, 온점 표기법으로 키 경로를 지정합니다.

```typescript
const { t } = useTranslation()
return <Text>{t("calendar.title")}</Text>
```

---

## lib

### date.ts

날짜 계산 및 변환 유틸리티 모음.

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `generateMonths` | `(count: number) => { year: number; month: number }[]` | 현재 월부터 과거 방향으로 지정 개수의 연월 배열 생성 |
| `getFirstDayOfWeek` | `(year: number, month: number) => number` | 해당 월 1일의 요일 반환 (월=0, 일=6) |
| `getDaysInMonth` | `(year: number, month: number) => number` | 해당 월의 총 일수 반환 |
| `getLocalDateKeyFromIso` | `(iso: string) => string` | ISO 타임스탬프를 로컬 날짜 키(`YYYY-MM-DD`)로 변환 |
| `getLocalDateKey` | `(date: Date) => string` | Date 객체를 로컬 날짜 키로 변환 |
| `getUtcMsFromDateKey` | `(dateKey: string) => number` | `YYYY-MM-DD` 형식 날짜를 UTC 자정 timestamp(ms)로 변환 |
| `getElapsedWeeksBetweenDateKeys` | `(startDateKey: string, endDateKey: string) => number` | 두 날짜 키 사이의 경과 주 수 반환 |
| `getThisWeekDateRange` | `() => { startDateKey: string; endDateKey: string }` | 이번 주 월요일~일요일 날짜 범위 반환 |
| `getDateAfterHours` | `(iso: string, hours: number) => Date` | ISO 시각 기준 지정 시간 후의 Date 반환 |
| `getIsoAfterHours` | `(iso: string, hours: number) => string` | ISO 시각 기준 지정 시간 후의 ISO 문자열 반환 |
| `getTimeDistanceMs` | `(a: string, b: string) => number` | 두 ISO 시각 간 절대 시간 차이(ms) 반환 |
| `getTimestampMsFromIso` | `(iso: string) => number \| null` | ISO 문자열을 ms timestamp로 변환 (유효성 검증 포함) |

```typescript
const key = getLocalDateKey(new Date()) // "2026-05-07"
```

### format.ts

날짜/시간 포맷팅 및 라벨 변환 함수.

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `formatDateWithDay` | `(date: Date) => string` | Date를 `MM.DD 요일` 형식으로 포맷 |
| `formatMonthYear` | `(date: Date) => string` | Date를 `YYYY년 M월` 형식으로 포맷 (i18n) |
| `bodyPartLabel` | `(key: string) => string` | 운동 부위 키를 번역된 라벨로 변환 |
| `bodyPartDetailLabel` | `(key: string) => string` | 운동 세부 부위 키를 번역된 라벨로 변환 |
| `formatDuration` | `(seconds: number) => string` | 초 단위를 `H:MM:SS` 형식으로 포맷 |
| `formatElapsedMs` | `(ms: number) => string` | 밀리초를 `MM:SS.CC` 형식으로 포맷 |
| `formatTime` | `(iso: string) => string` | ISO 타임스탬프를 `H:MM` 24시간 형식으로 포맷 |

```typescript
formatDuration(3661) // "1:01:01"
```

### group.ts

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `groupByMonth` | `<T extends { date: Date }>(items: T[]) => Map<string, T[]>` | 날짜 기반 아이템을 월별로 그룹핑하여 Map 반환 |

```typescript
groupByMonth(workouts).get('2026-5')
```

### legalLinks.ts

| Export | 타입 | 용도 |
|--------|------|------|
| `privacyPolicyUrl` | `string` | 개인정보처리방침 URL (expo.config에서 로드) |
| `supportUrl` | `string` | 고객 지원 페이지 URL (expo.config에서 로드) |

### notificationPermissionRequest.tsx

알림 권한 요청 모달 표시 가능 시점을 관리하는 Context.

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `NotificationPermissionRequestProvider` | `(props: PropsWithChildren & { done: boolean }) => JSX.Element` | 루틴 안내 모달 노출 가능 상태를 하위 화면에 제공 |
| `useNotificationPermissionRequestDone` | `() => boolean` | 루틴 안내 모달을 띄워도 되는 시점인지 확인하는 훅 |

### skiaChartPaths.ts

React Native Skia 차트 경로 생성 유틸리티.

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `buildLinePath` | `(points: ChartPoint[]) => SkiaPath \| null` | 포인트 배열로부터 선형 차트 경로 생성 (null이면 데이터 부족) |
| `buildAreaPath` | `(points: ChartPoint[], y0: number) => SkiaPath \| null` | 포인트 배열과 기준선으로부터 영역 차트 경로 생성 |

```typescript
buildLinePath([{ x: 0, y: 10 }, { x: 1, y: 20 }])
```

### protein-sale-notification

마이프로틴 등 단백질 제품 세일 알림을 예약/관리하는 시스템.

**모듈 구조**: `events.ts`가 판매 이벤트 데이터와 알림 계획 생성을, `scheduler.ts`가 권한 검사 및 예약 관리를, `storage.ts`가 AsyncStorage 영속성을, `permissions.ts`가 iOS 권한 요청을, `handler.ts`가 알림 탭 응답 라우팅을, `index.ts`가 공개 API를 담당합니다. 앱 시작 시 `syncProteinSaleNotificationsIfEnabled()`가 호출되어 활성화 상태를 동기화합니다.

#### events.ts

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `ProteinSaleEvent` | `interface` | 세일 이벤트 정의 (id, titleKey, 시작/종료일) |
| `ProteinSaleNotificationPlan` | `interface` | 특정 연도의 알림 계획 (eventId, 알림 예정 일시) |
| `getSaleReminderDate` | `(year, month, day) => Date` | 세일 시작일 전날 19:00 시각 계산 |
| `getBlackFridayDate` | `(year: number) => Date` | 해당 연도 11월 마지막 금요일 계산 |
| `buildProteinSaleNotificationPlans` | `(now?: Date) => ProteinSaleNotificationPlan[]` | 현재·다음 연도의 미래 세일 알림 계획을 시간순으로 생성 |

#### scheduler.ts

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `PROTEIN_SALE_NOTIFICATION_KIND` | `"myproteinSale"` | 알림 데이터 타입 상수 |
| `scheduleProteinSaleNotifications` | `(options?: { allowPrompt?: boolean }) => Promise<boolean>` | 권한 확인/요청 후 미래 세일 알림 전체 재예약 |
| `cancelProteinSaleNotifications` | `() => Promise<void>` | 저장된 예약 모두 취소 및 ID 목록 초기화 |
| `disableProteinSaleNotifications` | `() => Promise<void>` | 알림 비활성화 및 전체 예약 취소 |
| `syncProteinSaleNotificationsIfEnabled` | `() => Promise<void>` | 앱 시작 시 활성화 상태 확인 후 예약 동기화 |

#### permissions.ts

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `getProteinSaleNotificationPermissionGranted` | `() => Promise<boolean>` | iOS 알림 권한 상태 확인 (granted 또는 provisional) |
| `requestProteinSaleNotificationPermissions` | `() => Promise<boolean>` | iOS 알림 권한 요청 (사용자 ON 액션 시에만) |

#### handler.ts

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `setupProteinSaleNotificationHandler` | `() => () => void` | 알림 탭 응답 리스너 등록 및 콜드스타트 응답 처리 (언마운트 시 구독 해제 함수 반환) |

#### storage.ts

| Export | 시그니처 | 용도 |
|--------|---------|------|
| `getProteinSaleNotificationEnabled` | `() => Promise<boolean>` | AsyncStorage에서 알림 활성화 상태 조회 |
| `setProteinSaleNotificationEnabled` | `(enabled: boolean) => Promise<void>` | AsyncStorage에 알림 활성화 상태 저장 |
| `getProteinSaleNotificationIds` | `() => Promise<string[]>` | 예약된 알림 ID 목록 조회 (유효성 검증 포함) |
| `saveProteinSaleNotificationIds` | `(ids: string[]) => Promise<void>` | 예약 ID 목록을 JSON 형태로 저장 |
| `clearProteinSaleNotificationIds` | `() => Promise<void>` | 예약 ID 목록 초기화 |

---

## ui

### 기본 입력/액션

| 컴포넌트명 | 주요 Props | 용도 |
|-----------|----------|------|
| **Button** | `variant` (`primary`\|`accent`\|`outline`\|`ghost`\|`danger`\|`glass`), `label`, `onPress` | 다양한 시각적 우선순위를 지원하는 주요 액션 버튼 |
| **IconButton** | `variant` (`back-square`\|`back-round`\|`adjust`\|`glass`\|`edit`), `children` | 아이콘 기반 상호작용 요소 (뒤로가기, 조정, 편집 등) |
| **Input** | 표준 `TextInputProps`, `className` | 단일 행 텍스트 입력 필드 |
| **Textarea** *(Input 내 export)* | `multiline`, `placeholder`, `value` 등 | 다중행 텍스트 입력 (min-height 160px) |
| **GlassTextarea** *(Input 내 export)* | `value`, `onChangeText`, `minHeight`, `placeholder`, `defaultValue` | 글래스 효과가 적용된 투명 다중행 입력 |
| **Stepper** | `value`, `unit`, `label`, `min`/`max`, `onIncrement`/`onDecrement`, `jumpStep` | +/− 버튼으로 수치 조정하는 스테퍼 (점프 스텝 옵션) |
| **SegmentToggle** | `segments` (`string[]`), `activeIndex`, `onChangeIndex` | 탭 방식 세그먼트 선택 컨트롤 |

**스타일링 옵션**: Button, IconButton, Stepper는 `variant` 속성으로 시각적 변형을 가질 수 있습니다. Stepper는 `default`/`glass` 두 가지 스타일을 제공하며, SegmentToggle은 활성 세그먼트만 배경 강조 표시됩니다.

### 디스플레이

| 컴포넌트명 | 주요 Props | 용도 |
|-----------|----------|------|
| **Badge** | `level` (`low`\|`mid`\|`high`), `label` | 상태 표시 배지 (성공/정보/에러 색상) |
| **Chip** | `variant` (`default`\|`active`\|`glass`), `label` | 필터링/태그 표시용 작은 활성화 요소 |
| **FilterPill** *(Chip 내 export)* | `variant` (`default`\|`active`\|`glass`), `label` | 필터 선택용 알약 모양 버튼 (높이 40px) |
| **BodyPartPill** *(Chip 내 export)* | `variant` (`default`\|`active`), `label`, `onPress` | 신체 부위 선택 필터 (글래스 또는 배경 색상) |
| **Card** | `variant` (`default`\|`subtle`\|`glass`), `children`, `minHeight`, `cornerRadius` | 컨테이너 카드 + 다양한 서브컴포넌트 제공 |
| **StatCard** | `value`, `unit`, `label`, `subtitle`, `minHeight`, `onLongPress` | 통계 데이터 표시 카드 (글래스 배경) |
| **RingProgress** | `size`, `progress` (0~1), `trackColor`, `fillColor`, `strokeWidth` | 원형 프로그레스 바 (SVG 기반, 중앙에 자식 요소 배치 가능) |
| **BodyPartIcon** | `bodyPart`, `size` (`xs`\|`drawer`\|`sm`\|`md`\|`lg`\|`xl`), `framed` | 신체 부위별 아이콘 (6가지 부위, 옵션 배경 프레임) |
| **IconBox** | `size` (`sm`\|`md`\|`lg`\|`xl`), `children` | 정사각형/원형 아이콘 컨테이너 |

**스타일링 옵션**: Card는 다수의 서브컴포넌트(`Header`, `Label`, `Caption`, `Title`, `Metric`, `Icon`, `Divider`, `Row`, `Column`, `Gauge`)를 포함합니다. Chip 계열은 `glass` 변형을 지원하며, BodyPartIcon은 6가지 크기 옵션을 제공합니다.

### Glass / 배경 효과

| 컴포넌트명 | 주요 Props | 용도 |
|-----------|----------|------|
| **GlassBackground** | `cornerRadius`, `fallbackClassName` | 액체 글래스(Liquid Glass) 효과 배경 또는 폴백 색상 |
| **GlassCircleBackground** | 없음 | 전체 화면을 채우는 원형 글래스 배경 (fixed positioned) |
| **GlassSurface** | `children`, `cornerRadius`, `minHeight`, `paddingSize`, `contentStyle`, `fallbackClassName` | 글래스 효과 컨테이너 (`GlassBackground` 래핑) |

**특징**: 모두 `expo-glass-effect` 라이브러리 기반이며, 지원하지 않는 환경에서는 `fallbackClassName`으로 반투명 배경을 사용합니다. GlassSurface는 패딩과 보더 라운드 설정이 가능합니다.

### 레이아웃 / 특수

| 컴포넌트명 | 주요 Props | 용도 |
|-----------|----------|------|
| **Main** | `children`, `className` | 앱 전체 메인 컨테이너 (safe area 인셋 적용, 배경색 지정) |
| **HomeIndicator** | `className` | iPhone 홈 인디케이터 흉내 (134×5px, 중앙 하단) |
| **SettingsFab** | 없음 | 우상단 고정 설정 버튼 (글래스 배경, `/settings` 라우팅 내장) |

**특징**: Main은 safe area top 인셋 처리를 자동화합니다. HomeIndicator는 불투명도 15%의 회색 선이며, SettingsFab은 `gearshape.fill` 아이콘을 사용해 터치 시 설정 화면으로 이동합니다.
