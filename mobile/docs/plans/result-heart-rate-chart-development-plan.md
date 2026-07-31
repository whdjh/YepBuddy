# 운동 결과 심박수 그래프 개발 계획

> - 작성일: 2026-07-31
> - 상태: 기본 구현 존재, 보강·검증 계획
> - 대상 화면: `/workout/[id]` 운동 결과 화면
> - 데이터 원천: Apple HealthKit
> - 차트 기준: 프로틴 상세 화면의 가격 추이 그래프

## 1. 목표

운동 결과 화면에서 해당 운동 시간대의 HealthKit 심박수 샘플을 시계열 그래프로 보여준다.

예를 들어 결과 페이지의 운동이 7월 15일 18:00~18:50이라면, 7월 15일 하루 전체가 아니라 HealthKit에서 그 운동과 일치하는 workout 한 건을 찾고 정확히 18:00~18:50 구간의 HealthKit 심박수만 그래프로 그린다.

프로틴 상세 화면의 가격 추이 그래프가 사용하는 `victory-native`, Skia, `GlassSurface`, 디자인 토큰, 공용 path builder 패턴은 재사용한다. 다만 프로틴 도메인 컴포넌트인 `PriceTrendChart` 자체를 운동 결과 화면에서 직접 import하지는 않는다.

## 2. 현재 저장소 기준

요청한 기능의 기본 뼈대는 이미 구현되어 있다.

- `react-native-health`가 설치되어 있고 Expo config plugin과 HealthKit 사용 설명이 설정되어 있다.
- `src/entities/workout-session/api/healthKit.ts`가 운동 구간의 심박수 샘플을 `bpm` 단위, 오름차순으로 조회한다.
- `WorkoutHealthKitDetail.heartRateSamples`가 결과 화면에 전달된다.
- `src/features/view-result/ui/HeartRateChart.tsx`가 `victory-native`와 Skia로 라인·영역·평균선을 그린다.
- 두 차트가 `src/shared/lib/skiaChartPaths.ts`의 공용 line path builder를 함께 사용하고, 심박수 차트는 같은 모듈의 area path builder도 사용한다.
- `docs/page/02_result.md`에도 심박수 차트의 현재 동작이 이미 반영되어 있다.

현재 `react-native-health#getHeartRateSamples` 조회는 시작·종료 시각만 필터링하므로 특정 `HKWorkout`과의 연관성을 보장하지 않는다. 또한 네이티브 `readWorkoutDetail(sessionId)`와 JavaScript 조회가 각각 24시간 안의 최근접 workout을 독립적으로 고른다. 이 계획의 핵심 보강은 두 경로를 하나의 정확한 HealthKit workout 선택으로 통합하는 것이다.

따라서 이 문서는 신규 컴포넌트를 처음 만드는 계획이 아니라, 현재 구현을 사용자에게 안정적으로 제공하기 위한 데이터 정합성, 시간축, 다국어, 예외 처리, 실기기 검증 계획으로 사용한다.

## 3. 결정 요약

| 항목 | 결정 |
| --- | --- |
| 지원 플랫폼 | HealthKit을 사용할 수 있는 iOS만 지원한다. Android에서는 차트를 숨긴다. |
| 그래프 원천 | 그래프의 좌표와 최고·평균·최저는 선택된 workout 구간의 HealthKit 심박수 샘플만 사용한다. 로컬 세션 값이나 live metric으로 보충하지 않는다. |
| 데이터 조회 | 결과 화면의 운동과 일치하는 HealthKit workout 한 건을 먼저 확정한 뒤 그 workout의 `startDate`~`endDate` 구간만 조회한다. |
| 운동 매칭 | 저장된 `healthKitWorkoutUUID`의 정확 일치를 우선한다. UUID가 없는 과거 기록은 날짜와 시작·종료 시각이 허용 오차 안에서 일치하는 후보가 정확히 1건일 때만 사용한다. |
| 과거 기록 매칭 위치 | TypeScript entity helper가 HealthKit workout 후보의 UUID를 결정하고, 네이티브 bridge는 전달받은 UUID의 정확 조회만 담당한다. |
| 연관 샘플 조회 | 커스텀 네이티브 HealthKit bridge에서 선택된 `HKWorkout` 연관 predicate와 workout 시작~종료 predicate를 함께 적용한다. |
| 매칭 실패 | 후보가 없거나 여러 개면 다른 운동의 데이터를 추정해 사용하지 않고 차트를 숨긴다. |
| 단위 | `bpm`으로 고정하고 UI에는 `BPM`을 표시한다. |
| 정렬 | 유효한 `startDate` 기준 오름차순으로 정렬한다. |
| 차트 축 | X축 domain은 선택된 workout의 시작~종료 시각으로 고정하고 샘플의 실제 시각 비율을 사용한다. Y축은 최저~최고 BPM에 여백을 둔다. |
| pause 표현 | `HKWorkout.duration`과 wall-clock이 다르면 pause 구간을 압축하지 않고 실제 시각의 빈 구간으로 남긴다. |
| 선 형태 | 프로틴 가격 차트와 같은 직선 polyline을 사용한다. 현재 기능서의 “곡선” 표현은 목표 동작에 맞게 수정한다. |
| 차트 재사용 | 프로틴 차트의 라이브러리·표면·토큰·공용 path builder를 재사용하고 도메인 컴포넌트는 분리한다. |
| 차트 평균값 | 선택된 workout 구간의 유효한 HealthKit 심박수 샘플 평균을 반올림한다. |
| 평균 표시 | 차트가 보이면 평균 숫자 라벨은 항상 표시하고, 평균 점선만 최고·최저와 충분한 간격이 있을 때 표시한다. |
| 표시 조건 | 유효 샘플이 2개 이상일 때만 차트 섹션을 표시한다. |
| 빈 상태 | 샘플이 0~1개이거나 조회할 수 없으면 차트 섹션을 숨기고 결과 화면의 나머지 정보는 정상 표시한다. |
| 권한 요청 | 결과 조회만을 이유로 반복해서 권한 팝업을 띄우지 않고 기존 HealthKit 접근 상태를 따른다. |
| 저장 | 차트 원본 샘플은 앱 저장소나 서버에 복제하지 않고 화면 진입 시 HealthKit에서 읽는다. |

## 4. 사용자 경험

### 4.1 정상 상태

1. 사용자가 완료된 운동 결과 화면에 진입한다.
2. 로컬 완료 세션과 HealthKit 상세를 함께 조회한다.
3. 일치하는 workout의 유효한 심박수 샘플이 2개 이상이면 `심박수` 섹션을 표시한다.
4. 카드 상단에 최고, 평균, 최저 BPM을 표시한다.
5. 그래프 하단에는 선택된 HealthKit workout의 시작 시각과 종료 시각을 표시한다.
6. 평균 BPM 숫자는 항상 표시하고, 최고·최저선과 시각적으로 겹치지 않을 때만 평균 점선을 표시한다.

### 4.2 데이터가 없는 상태

- HealthKit을 사용할 수 없는 기기
- HealthKit 읽기 권한이 없거나 조회가 실패한 경우
- 일치하는 workout이 없는 경우
- workout은 있지만 심박수 샘플이 없는 경우

위 경우에는 심박수 차트 섹션 전체를 숨긴다. 로컬 세션, 운동 시간, 세트 수, 메모, 위치 등 결과 화면의 다른 기능은 영향을 받지 않는다.

### 4.3 부분 데이터

- 완료 시 저장된 HealthKit 유래 평균값만 있고 원본 HealthKit 샘플이 없으면 통계 카드에는 평균 심박수를 표시할 수 있지만 차트는 만들지 않는다.
- 유효한 HealthKit 샘플이 1개뿐이면 샘플 평균은 통계 카드의 마지막 폴백으로 사용할 수 있지만, 의미 있는 선을 만들 수 없으므로 차트 섹션은 숨긴다.
- 모든 샘플의 BPM이 같아도 0 높이 domain이 되지 않도록 Y축에 최소 여백을 둔다.
- 일시정지 등으로 샘플 간 시간 간격이 길면 실제 시간축 간격에 반영한다.

## 5. 데이터 흐름

```text
/workout/[id]
  -> view-result/useSessionDetail
  -> workout-session/getWorkoutSessionDetailData
      -> 로컬 StoredWorkoutSession 조회
      -> HealthKit workout UUID 결정
          -> storedSession.healthKitWorkoutUUID가 있으면 그대로 사용
          -> 없으면 같은 날짜 workout 후보 조회
          -> TS helper로 시작/종료 2분 이내 유일 후보의 UUID 선택
          -> 후보 0건/복수면 null
      -> native WorkoutSession.readWorkoutDetail(workoutUUID)
          -> UUID predicate로 HKWorkout 정확 조회 또는 null
          -> HKQuery.predicateForObjects(from: matchedWorkout)
          -> matchedWorkout.startDate~endDate 구간 predicate
          -> heart-rate HKSampleQuery(ascending)
          -> 샘플 검증·정렬·정규화
  -> WorkoutHealthKitDetail
      -> workoutUUID/startDate/endDate/duration
      -> heartRateSamples
  -> ResultScreen 표시 모델
  -> HeartRateChart
  -> victory-native 좌표 계산
  -> Skia line/area/guide 렌더링
```

## 6. 데이터 계약

결과 화면이 정확한 workout과 그래프 구간을 알 수 있도록 심박수 샘플에는 HealthKit sample UUID를, HealthKit 상세에는 선택된 workout 식별자와 시작·종료 시각을 포함한다.

```ts
interface WorkoutHeartRateSample {
  sampleUUID: string
  bpm: number
  startDate: string
  endDate: string
}

interface WorkoutHealthKitDetail {
  workoutUUID: string
  startDate: string
  endDate: string
  duration: number
  heartRateSamples: WorkoutHeartRateSample[]
  // 기존 칼로리·평균 필드 유지
}
```

샘플 정규화 규칙:

- `bpm`이 유한한 양수인 샘플만 사용한다.
- `startDate`와 `endDate`가 유효한 날짜인 샘플만 사용한다.
- `endDate`가 `startDate`보다 빠른 샘플은 제외한다.
- 선택된 HealthKit workout의 `startDate`~`endDate` 구간 밖 샘플은 제외한다.
- `startDate` 오름차순으로 정렬한다.
- 같은 `sampleUUID`가 중복 반환되면 첫 항목만 유지한다.
- 서로 다른 sample UUID가 같은 `startDate`를 가져도 HealthKit 원본을 임의로 평균하거나 버리지 않고 `endDate`, `sampleUUID` 순으로 안정 정렬해 모두 유지한다.
- 좌표값은 HealthKit query가 반환한 심박수 샘플만 사용하고 앱의 로컬 평균, 실시간 metric, 임의 보간값은 넣지 않는다.
- 평균, 최저, 최고는 정규화가 끝난 동일한 샘플 집합으로 계산한다.
- 샘플의 `startDate`가 workout 시작·종료 시각과 같은 경계값이면 포함한다.

표시 모델은 feature 내부에서 만든다.

```ts
interface HeartRateChartPoint {
  timestamp: number
  bpm: number
}
```

`timestamp`는 `Date.parse(sample.startDate)` 결과를 사용한다. 차트 X축은 workout 시작 시각을 0으로 두는 상대 밀리초 값으로 변환해도 되지만, domain의 양 끝은 첫·마지막 샘플이 아니라 HealthKit workout의 시작·종료 시각이어야 한다.

## 7. FSD 책임 분리

### `entities/workout-session`

- HealthKit 권한과 샘플 조회
- HealthKit workout 매칭
- 외부 응답 검증과 `WorkoutHeartRateSample` 정규화
- 운동 UUID 우선 조회와 과거 기록 폴백

### `plugins/ios/workout-session`

- `HKWorkout` UUID 정확 조회
- `HKQuery.predicateForObjects(from:)` 기반 연관 심박수 조회
- workout 식별자·시간 범위·심박수 샘플 native payload 생성
- Expo prebuild가 재생성할 수 있는 plugin source 유지

### `features/view-result`

- 결과 화면에서 차트 표시 여부 결정
- 통계 카드의 기존 평균 폴백과 차트 전용 HealthKit 샘플 평균을 구분
- 심박 샘플을 차트 표시 모델로 변환
- 최고·평균·최저 라벨과 시간 라벨 구성
- `HeartRateChart` 렌더링

### `shared`

- 심박수나 프로틴을 모르는 Skia path builder
- 공용 디자인 토큰과 색상 해석 hook
- `GlassSurface`

### 금지할 구조

- `view-result`가 `entities/protein/ui/PriceTrendChart`를 직접 import하지 않는다.
- `protein` entity에 심박수 조건이나 BPM 표현을 추가하지 않는다.
- HealthKit API 호출을 `HeartRateChart` UI 안에서 수행하지 않는다.
- 차트 재사용을 이유로 심박수와 가격 도메인 타입을 하나의 거대한 공용 타입으로 합치지 않는다.

## 8. 구현 단계

### 단계 0. 현재 구현 회귀 기준 고정

작업:

- 구현 코드보다 먼저 `docs/page/02_result.md`를 목표 동작으로 갱신한다.
- 차트 표시 조건을 유효 샘플 2개 이상으로 바꾼다.
- 샘플 순서 기반 X축을 실제 시간 비율 X축으로 바꾼다.
- X축 시작·종료 라벨을 첫·마지막 샘플 시각이 아니라 선택된 HealthKit workout의 시작·종료 시각으로 바꾼다.
- 차트의 최고·평균·최저는 선택된 HealthKit 샘플에서만 계산한다고 명시한다.
- 평균 숫자 라벨은 항상 표시하고 평균 guide만 조건부로 표시한다고 명시한다.
- 실제 구현과 맞지 않는 “곡선 라인”을 프로틴 가격 차트와 같은 직선 polyline으로 정정한다.
- 현재 iOS 개발 빌드에서 결과 화면 진입, 차트 조건부 표시, 평균 심박수 카드 동작을 기록한다.
- 프로틴 가격 차트와 공유 중인 라이브러리 및 path builder 경계를 확인한다.

완료 기준:

- 보강 전후 비교가 가능한 실제 HealthKit workout 샘플 또는 개발용 fixture를 확보한다.
- 기존 프로틴 가격 차트의 렌더링이 변경되지 않아야 한다.

### 단계 1. HealthKit workout 매칭과 샘플 정규화

작업:

- fallback `react-native-health#saveWorkout` callback의 UUID 문자열을 버리지 않고 `WorkoutSessionEndResult.healthKitWorkoutUUID`와 완료 세션에 저장한다.
- 빈 값이나 유효하지 않은 fallback 저장 결과는 UUID로 저장하지 않도록 정규화하고 테스트한다.
- `getWorkoutSessionDetailData`가 저장 세션을 먼저 조회한 뒤 UUID·시작·종료 시각으로 HealthKit 상세 조회를 이어서 실행하도록 기존 `Promise.all`을 순차 조합으로 바꾼다.
- 저장된 UUID가 있으면 시간 폴백 없이 해당 UUID를 사용한다.
- UUID가 없는 과거 세션은 TypeScript `healthKitWorkoutMatch` helper가 같은 로컬 날짜의 workout 후보 중 시작 시각과 종료 시각이 각각 2분 이내로 일치하는 후보를 고른다.
- 일치 후보가 정확히 1건일 때 그 후보의 UUID를 네이티브 bridge에 전달한다.
- `HKWorkout.duration`은 pause event에 따라 시작~종료 wall-clock과 다를 수 있으므로 과거 세션의 hard match 조건으로 사용하지 않고 진단·검증 값으로만 남긴다.
- 후보가 없거나 여러 개면 임의의 최근접 workout을 고르지 않고 HealthKit 상세를 `null`로 처리한다.
- `LiveWorkoutSessionController`는 전달받은 UUID predicate로 같은 UUID의 `HKWorkout`을 정확히 한 건 조회하며 자체 시간 폴백을 하지 않는다.
- 선택된 `HKWorkout`에 `HKQuery.predicateForObjects(from:)`와 workout 시작~종료 predicate를 함께 적용해 연관된 heart-rate sample을 오름차순으로 조회한다.
- 시간 predicate는 `HKQuery.predicateForSamples(withStart:end:options:[.strictStartDate])`를 사용하고, payload 정규화에서도 `startDate`가 workout 양 끝 경계 안인지 다시 확인한다.
- `WorkoutSessionModule`과 `WorkoutSessionBridge.m`의 `readWorkoutDetail(workoutUUID)` 입력·출력 계약을 갱신한다.
- JavaScript의 기간 기반 `react-native-health#getHeartRateSamples`는 결과 그래프 경로에서 제거한다.
- 비정상 BPM, 잘못된 날짜, 운동 범위 밖 샘플을 제거한다.
- 선택된 workout의 시작·종료 시각 밖에 있는 HealthKit 샘플은 사용하지 않는다.
- workout은 찾았지만 연관 심박 샘플이 없거나 심박 query만 실패하면 duration·칼로리를 포함한 detail과 빈 `heartRateSamples`를 반환한다.
- workout 조회 자체가 실패하면 HealthKit detail을 `null`로 안전하게 폴백하고 개발 로그에서 원인을 확인할 수 있게 한다.

완료 기준:

- 같은 날 여러 운동이 있어도 다른 workout의 심박수 샘플을 선택하지 않는다.
- iPhone live workout과 fallback `saveWorkout`으로 새로 저장되는 모든 HealthKit workout의 UUID가 완료 세션에 남는다.
- 잘못된 샘플이 평균·최저·최고·차트 domain에 들어가지 않는다.
- HealthKit 실패가 결과 화면 전체 실패로 전파되지 않는다.

### 단계 2. 실제 시간축 기반 차트 보강

작업:

- `ResultScreen`에서 샘플 index 대신 실제 timestamp와 선택된 HealthKit workout의 시작·종료 시각을 차트에 전달한다.
- `HeartRateChart`의 `xKey`를 실제 시간값으로 사용한다.
- X축 domain과 하단 라벨을 선택된 HealthKit workout의 시작~종료로 고정한다.
- 일정하지 않은 샘플 간격과 운동 일시정지 구간이 X축 간격에 반영되게 한다.
- pause 구간을 압축하거나 임의 보간하지 않고 HealthKit timestamp의 공백으로 그대로 표현한다.
- 단일 샘플은 차트를 숨기고, 동일 BPM 샘플은 Y축 최소 여백을 적용한다.
- 차트의 최고·평균·최저를 전달받은 HealthKit 샘플만으로 계산한다.
- 평균 숫자 라벨은 항상 렌더링하고, 평균 guide line만 min/max와의 간격 규칙에 따라 조건부로 렌더링한다.
- 프로틴 차트와 동일하게 `GlassSurface`, `victory-native`, Skia path builder를 유지한다.
- 심박수 semantic color와 light/dark opacity를 디자인 토큰으로 처리한다.
- 현재 차트의 정적 텍스트·높이 inline style을 NativeWind className과 디자인 토큰으로 옮긴다. Skia 좌표·동적 색상처럼 className을 적용할 수 없는 렌더링 값만 props로 유지한다.

완료 기준:

- 샘플 간 1분과 10분 간격이 같은 폭으로 그려지지 않는다.
- 최저, 최고, 평균 guide가 chart bounds 안에 정확히 배치된다.
- 작은 화면과 light/dark 모드에서 클리핑이나 대비 문제가 없다.

### 단계 3. 문구와 접근성

작업:

- `최고`, `평균`, `최저`, BPM 표시를 `ko.json`과 `en.json`으로 이동한다.
- 차트에 운동 시작·종료 시각과 요약 수치를 읽을 수 있는 접근성 설명을 제공한다.
- 색상만으로 평균선과 다른 기준선을 구분하지 않도록 라벨을 유지한다.

완료 기준:

- 한국어와 영어에서 하드코딩 문구가 노출되지 않는다.
- VoiceOver에서 차트가 최고·평균·최저 심박수와 시간 범위를 설명한다.

### 단계 4. 검증과 canonical 문서 대조

작업:

- 순수 함수 테스트: fallback 저장 UUID 정규화, 과거 workout 정확 매칭, 샘플 정규화, HealthKit 샘플 평균, 실제 시간축 변환
- 차트 edge case 검증: 0개, 1개, 동일 BPM, 잘못된 날짜, 긴 운동, 샘플 간 큰 공백
- iOS 실기기 검증: iPhone 단독, Apple Watch 기록, 권한 허용/미허용, 과거 운동
- UI 검증: iPhone 13 mini 기준, light/dark, 한국어/영어
- `bun test src/entities/workout-session/lib/healthKitWorkoutMatch.test.ts src/features/view-result/model/heartRateChartModel.test.ts`로 순수 함수 테스트 실행
- `bunx tsc --noEmit`으로 TypeScript 검사
- `bun run lint`로 lint 검사
- `bun run test:workout-session-plugin`으로 canonical plugin source 등록 계약 검사
- Xcode에서 iOS 개발 빌드와 실제 HealthKit query 검사
- 단계 0에서 갱신한 `docs/page/02_result.md`를 실제 검증 결과와 최종 대조한다.

완료 기준:

- canonical 기능서와 실제 동작이 일치한다.
- 프로틴 가격 그래프에 회귀가 없다.
- HealthKit 데이터 유무와 관계없이 결과 화면 진입과 편집·삭제 기능이 유지된다.

## 9. 예상 파일 영향 범위

| 영역 | 예상 파일 | 변경 목적 |
| --- | --- | --- |
| HealthKit entity | `src/entities/workout-session/api/healthKit.ts` | fallback 저장 UUID 보존, 후보 조회, native UUID 상세 호출 |
| HealthKit detail 조합 | `src/entities/workout-session/lib/sessionHealthKitData.ts` | 저장 세션 선조회 후 HealthKit 상세 순차 조회 |
| workout 매칭 helper | `src/entities/workout-session/lib/healthKitWorkoutMatch.ts`와 `.test.ts` | 저장 UUID 정규화, 과거 workout 시작·종료 유일 후보 선택 |
| 도메인 타입 | `src/entities/workout-session/model/types.ts` | 필요 시 상세 조회 입력 계약 보강 |
| entity public API | `src/entities/workout-session/index.ts` | 새 순수 helper가 외부에 필요할 때만 공개 |
| iOS canonical source | `plugins/ios/workout-session/LiveWorkoutSessionController.swift` | 전달된 UUID workout 및 연관 심박 샘플 조회 |
| iOS bridge | `plugins/ios/workout-session/WorkoutSessionModule.swift`, `WorkoutSessionBridge.m` | 상세 조회 입력·출력 계약 |
| Expo config plugin | `plugins/with-workout-session.js` | 변경된 canonical native source 등록 유지 |
| plugin 검증 | `scripts/check_workout_session_plugin.cjs` | source 등록과 bridge 계약 검사 |
| 결과 hook | `src/features/view-result/model/useSessionDetail.ts` | 기존 entity public API 소비 유지, 새 HealthKit 매칭 책임 추가 금지 |
| 결과 표시 모델 | `src/features/view-result/model/heartRateChartModel.ts`와 `.test.ts` | HealthKit 샘플 통계와 시간축 변환 |
| 결과 화면 | `src/features/view-result/ui/ResultScreen.tsx` | 조건부 섹션과 timestamp 전달 |
| 심박 차트 | `src/features/view-result/ui/HeartRateChart.tsx` | 실제 시간축, edge case, 접근성 |
| 다국어 | `src/shared/i18n/locales/ko.json`, `en.json` | 최고·평균·최저와 접근성 문구 |
| canonical 문서 | `docs/page/02_result.md` | 검증된 최종 동작 반영 |

`PriceTrendChart.tsx`와 `skiaChartPaths.ts`는 현재 공용 경계로 충분하면 수정하지 않는다. 심박수 때문에 프로틴 차트 코드를 함께 바꾸는 작업은 피한다.

`ios/app/*`의 생성 결과는 직접 원본처럼 수정하지 않는다. `plugins/ios/workout-session/*`를 먼저 변경하고 Expo prebuild/plugin 경로로 다시 생성한다.

## 10. 테스트 시나리오

| 시나리오 | 기대 결과 |
| --- | --- |
| 7월 15일 18:00~18:50 workout | X축 18:00~18:50에 해당 구간의 HealthKit 심박수만 표시 |
| 정상 심박 샘플 여러 개 | workout 전체 시간 domain에서 시간 비율을 보존한 라인·영역 차트와 최고/평균/최저 표시 |
| 저장 평균과 HealthKit 샘플 모두 존재 | 통계 카드는 기존 폴백을 유지할 수 있지만 차트 평균은 HealthKit 샘플만으로 계산 |
| 평균만 존재, 샘플 없음 | 통계 카드만 표시하고 차트 섹션은 숨김 |
| 심박 샘플 0개 | 차트 섹션 숨김, 다른 결과 정보 정상 표시 |
| 심박 샘플 1개 | 샘플 평균은 통계 카드에 사용할 수 있고 차트 섹션은 숨김 |
| 모든 BPM 동일 | 유효한 Y domain을 만들고 클리핑 없이 표시 |
| NaN, 0, 음수 BPM | 해당 샘플 제외 |
| 잘못된 날짜 | 해당 샘플 제외 |
| 같은 날 운동 2개, UUID 있음 | UUID가 일치하는 workout만 선택 |
| UUID 없는 과거 운동, 유일한 시간 일치 | 시작·종료 각각 2분 허용 오차 안의 유일한 workout만 선택 |
| UUID 없는 과거 운동, 후보 여러 개 | 임의 선택 없이 차트 숨김 |
| UUID는 있으나 HealthKit workout 삭제됨 | 시간 폴백 없이 차트 숨김 |
| fallback `saveWorkout` 신규 세션 | callback UUID를 완료 세션에 저장하고 이후 정확 조회에 사용 |
| 같은 sample UUID가 중복 반환 | 한 번만 사용 |
| 서로 다른 sample UUID의 시각이 같음 | 임의 평균 없이 모두 유지하고 안정 정렬 |
| 샘플 시각이 workout 시작·종료와 정확히 같음 | 양 끝 경계 샘플 모두 포함 |
| 운동 중 pause가 존재 | pause 시간을 임의 압축·보간하지 않고 실제 HealthKit timestamp 공백으로 표시 |
| workout 조회 성공, 심박 query 실패 | duration·칼로리 detail은 유지하고 차트만 숨김 |
| workout UUID 조회 실패 | HealthKit detail은 `null`, 로컬 결과 화면은 유지 |
| Apple Watch가 기록한 심박수 | HealthKit에 동기화된 샘플을 같은 결과 차트에 표시 |
| 권한 미허용/HealthKit 불가 | 결과 화면 유지, 차트만 숨김 |
| Android | HealthKit 호출 없이 차트 숨김 |
| light/dark, ko/en | 토큰 대비와 번역 문구 정상 |

## 11. 주요 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 같은 날 다른 workout을 잘못 선택 | 저장된 HealthKit UUID의 정확 일치 우선, 과거 기록은 시작·종료가 모두 일치하는 유일 후보만 허용 |
| 로컬 또는 live metric이 그래프에 혼입 | 차트 좌표와 통계를 선택된 구간의 HealthKit 심박수 샘플만으로 계산 |
| 단순 시간 필터에 다른 HealthKit 샘플 혼입 | 선택된 `HKWorkout` 연관 predicate와 시간 predicate를 네이티브 query에서 함께 적용 |
| 읽기 권한 거부와 데이터 없음이 모두 빈 결과로 보임 | 결과 화면은 유지하고 차트만 숨기는 동일한 안전 동작 적용 |
| HealthKit 기록 삭제·권한 철회 후 과거 차트 소실 | 원본을 앱에 복제하지 않는 개인정보 결정을 명시하고 빈 상태 허용 |
| 샘플 index 축이 센서 공백을 숨김 | 실제 timestamp 기반 X축 사용 |
| 긴 세션의 고밀도 샘플 렌더링 비용 | 실기기 성능을 측정하고 문제가 확인될 때 최고·최저 보존 downsampling을 별도 적용 |
| 저장 평균과 차트 샘플의 workout 불일치 | UUID 매칭 후 같은 workout에서 파생된 값인지 검증 |
| fallback 저장 UUID 유실 | `saveWorkout` callback의 UUID 문자열을 종료 결과와 완료 세션에 보존 |
| 시뮬레이터 검증의 한계 | HealthKit 데이터가 있는 실제 iPhone과 Apple Watch 기록으로 완료 검증 |

## 12. 범위 제외

- 운동 중 실시간 심박수 수집과 웨어러블 연결
- Android Health Connect 또는 Galaxy Watch 심박수 결과 차트
- 서버 업로드와 계정 간 심박수 동기화
- 심박 구간(zone) 분석과 의료적 해석
- 차트 확대, 스크럽, 툴팁, 샘플 편집
- HealthKit 원본 데이터 삭제

Apple Watch·Galaxy Watch의 실시간 심박수 수집은 `docs/plans/wearable-heart-rate-development-plan.md`의 별도 범위다. 이 계획은 HealthKit에 이미 저장된 결과 데이터를 읽어 결과 화면에 표시하는 데 한정한다.

## 13. 구현 시작 전 확인할 결정

현재 기본값은 다음과 같이 둔다.

1. HealthKit 샘플 원본은 로컬에 중복 저장하지 않는다.
2. 권한/조회 오류 전용 빈 카드나 Alert는 추가하지 않는다.
3. 차트는 선택된 HealthKit workout의 시작~종료를 전체 X축으로 사용하는 실제 시간축을 사용한다.
4. UUID가 없는 과거 기록은 시작·종료가 각각 2분 이내인 후보가 정확히 1건일 때만 허용한다.
5. 같은 sample UUID만 중복 제거하고 서로 다른 HealthKit 원본 샘플은 같은 시각이어도 모두 유지한다.
6. 대용량 샘플 downsampling은 실제 성능 문제가 확인될 때 별도 작업으로 추가한다.

## 14. 완료 조건

1. 결과 화면이 현재 세션에 정확히 대응하는 HealthKit workout 한 건을 식별한다.
2. 해당 `HKWorkout`에 연관되고 시작~종료 구간에 포함된 HealthKit 심박수 샘플만 그래프 좌표와 최고·평균·최저에 사용한다.
3. X축 양 끝은 해당 HealthKit workout의 시작·종료 시각이며 실제 샘플 시간 간격이 반영된다.
4. HealthKit 데이터가 없어도 결과 화면의 나머지 기능은 정상 동작한다.
5. 프로틴 가격 그래프를 포함한 기존 차트에 회귀가 없다.
6. iOS 실기기, light/dark, ko/en 검증을 통과한다.
7. `docs/page/02_result.md`가 최종 검증 동작과 일치한다.

## 15. 참고 문서

- [react-native-health: Heart Rate Samples](https://github.com/agencyenterprise/react-native-health/blob/master/docs/getHeartRateSamples.md)
- [react-native-health: Expo 설정](https://github.com/agencyenterprise/react-native-health/blob/master/docs/Expo.md)
- [Apple HealthKit: UUID predicate](https://developer.apple.com/documentation/healthkit/hkquery/predicateforobject%28with%3A%29)
- [Apple HealthKit: workout 연관 object predicate](https://developer.apple.com/documentation/healthkit/hkquery/predicateforobjects%28from%3A%29-5irg9)
- [Apple HealthKit: HKWorkout](https://developer.apple.com/documentation/healthkit/hkworkout)
- [운동 결과 화면 기능서](../page/02_result.md)
- [웨어러블 실시간 심박수 개발 계획](./wearable-heart-rate-development-plan.md)
