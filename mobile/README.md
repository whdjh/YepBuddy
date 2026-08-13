# YepBuddy Mobile

운동 기록과 루틴 진행, 운동 템포, 프로틴 가격 확인을 제공하는 Expo/React Native 기반 iOS·Android 피트니스 앱입니다.

운동 중 앱이 종료되어도 기록을 이어갈 수 있도록 진행 상태를 복구하고, iOS에서는 HealthKit과 Live Activity를 연결해 심박수와 칼로리를 운동 화면에 반영합니다.

[서비스 바로가기](https://yepbuddy.netlify.app/)

## 전체 아키텍처

![YepBuddy Mobile 전체 아키텍처](./docs/assets/mobile-architecture.png)

---

## 핵심 구현

### 1. 상태 관리와 스냅샷 복구를 통한 운동 기록 유실 방지

> 운동 상태 변경을 하나의 경로로 통합하고, 앱 재실행 시 검증된 스냅샷으로 진행 중 기록을 복원합니다.

#### 문제

운동은 시작부터 종료까지 오랜 시간 이어지며, 그동안 운동 부위와 세트 수, 메모, 위치와 일시정지 시간이 계속 변경됩니다. 이 상태를 화면별로 관리하면 화면 이동 시 값이 어긋날 수 있고, 앱이 종료되면 메모를 포함한 진행 기록 전체가 메모리에서 사라집니다.

저장 기능을 추가한 뒤에도 저장소 읽기 실패 중 새 운동이 기존 기록을 덮거나, 종료 시점보다 늦게 완료된 비동기 저장이 삭제한 스냅샷을 다시 만드는 경합을 함께 막아야 했습니다.

#### 스냅샷 복구를 선택한 이유

- 화면별 상태: 각 화면의 구현은 단순하지만 운동 단계가 바뀔 때 상태 전달과 동기화가 반복됨
- 전역 상태만 사용: 화면 간 상태는 유지하지만 프로세스가 종료되면 기록을 복구할 수 없음
- reducer와 로컬 스냅샷: 상태 변경 경로를 통합하면서 서버 연결 없이 진행 중 운동을 즉시 복구 가능

`WorkoutProvider`의 reducer를 운동 상태의 기준으로 두고, 복구에 필요한 값을 AsyncStorage에 스냅샷으로 저장했습니다. 저장값은 버전과 런타임 검증을 거쳐 복원하며, 저장과 삭제 순서도 하나의 큐에서 관리했습니다.

#### 구현 과정

##### 1. 운동 흐름과 상태 변경을 하나의 reducer로 통합

```tsx
const [state, dispatch] = useReducer(workoutReducer, initialWorkoutState)
```

- 운동 단계를 `idle → countdown → recording ↔ paused → completed`로 정의
- 세션 ID, 시작·일시정지 시각, 운동 부위, 세트 수, 메모와 위치를 하나의 `WorkoutState`에서 관리
- 화면은 상태를 직접 변경하지 않고 `useWorkoutActions`를 통해 reducer action 실행
- 시작 시각과 누적 일시정지 시간으로 경과 시간을 다시 계산해 타이머 자체를 저장하지 않음

##### 2. 복구 핵심값은 즉시, 메모는 1초 간격으로 저장

```tsx
useEffect(() => {
  if (isHydrated) {
    saveRecoverableWorkoutSnapshot()
  }
}, [
  isHydrated,
  state.phase,
  state.startedAt,
  state.pausedAt,
  state.pausedDuration,
  state.bodyParts,
  state.cardioStartedAt,
  state.location,
])

useDebouncedEffect(
  () => {
    if (isHydrated) {
      saveRecoverableWorkoutSnapshot()
    }
  },
  1000,
  [isHydrated, state.memo],
)
```

- 운동 단계, 시각, 운동 부위와 세트 수, 위치는 변경 직후 저장
- 입력마다 쓰기가 발생하는 메모만 1초 디바운스 적용
- 심박수와 칼로리만 변경될 때는 저장을 실행하지 않아 센서 갱신에 따른 쓰기 부하 방지
- `idle`, `completed` 상태는 진행 중 스냅샷으로 저장하지 않음

##### 3. 버전과 런타임 검증을 거쳐 상태 복원

```ts
const snapshot = {
  schemaVersion: 1,
  state,
}
```

- JSON 형태뿐 아니라 운동 단계, ISO 시각, 세트 수, 위치 좌표와 단계별 필수값까지 검사
- 버전이 없는 기존 스냅샷은 현재 기본값과 병합하고 검증한 뒤 `schemaVersion: 1`로 마이그레이션
- 손상된 JSON과 지원하지 않는 버전은 복원하지 않고 활성 저장 키에서 제거
- 검증된 `recording`, `paused` 상태는 `HYDRATE`로 복원하고 운동 화면으로 다시 연결

##### 4. 저장과 삭제의 경합으로 스냅샷이 되살아나는 문제 차단

```ts
const clear = () => {
  writesEnabled = false
  writeGeneration += 1

  return enqueueMutation(() =>
    adapter.removeItem(CURRENT_WORKOUT_STORAGE_KEY),
  )
}
```

- 하나의 Promise queue에서 스냅샷 저장과 삭제를 순서대로 실행
- 운동 세대마다 `writeGeneration`을 두어 삭제 전에 예약된 오래된 저장 무효화
- 저장소 읽기에 성공한 뒤에만 새 쓰기를 허용해 읽기 실패 중 기존 기록을 덮지 않도록 차단
- 완료 세션 저장이 성공한 뒤 진행 중 스냅샷을 삭제하고, 저장 실패 시에는 복구용 스냅샷 유지

#### 결과

- 앱 재실행 후 운동 부위, 세트 수, 메모, 위치와 시작·일시정지 상태 복원
- 시작 시각과 누적 일시정지 시간으로 운동 타이머 재구성
- 손상되거나 지원하지 않는 저장값을 복원 경로에서 격리
- 저장소 읽기 실패와 저장·삭제 경합으로 기존 운동 기록이 덮이거나 다시 생성되는 문제 방지

---

### 2. 플랫폼별 디자인을 공통 컴포넌트로 통합한 iOS·Android UI 구축

> 화면에서는 동일한 컴포넌트 API를 사용하고, 공통 표면 계층이 실행 환경에 맞는 네이티브 렌더링과 폴백을 선택합니다.

#### 문제

iOS 26의 Liquid Glass와 SwiftUI 구성 요소는 Android와 구형 iOS에서 사용할 수 없습니다. 화면마다 플랫폼 조건을 추가하면 같은 카드와 버튼의 구조와 스타일이 중복되고, 다크 모드와 투명도 감소 설정도 각 화면에서 따로 처리해야 합니다.

#### 공통 컴포넌트를 선택한 이유

- 화면별 플랫폼 분기: 빠르게 적용할 수 있지만 조건문과 중복 스타일이 화면 수에 따라 증가
- 플랫폼별 화면 분리: 각 OS에 최적화할 수 있지만 기능 변경을 두 화면에 반복 적용해야 함
- 공통 API와 플랫폼별 렌더러: 화면 구조는 공유하면서 네이티브 차이가 필요한 내부 구현만 분리 가능

카드, 버튼과 수치 조절 UI의 사용 방식을 공통화하고, Liquid Glass 지원 여부와 접근성 설정은 하위 표면 컴포넌트에서 결정하도록 구성했습니다.

#### 구현 과정

##### 1. 화면에서는 플랫폼과 관계없이 같은 API 사용

```tsx
<Card variant="glass">
  <Card.Row>
    <Card.Title>{title}</Card.Title>
    <Card.Spacer />
  </Card.Row>
</Card>

<Stepper
  variant="glass"
  label="세트"
  value={setCount}
  unit="세트"
  onDecrement={decrementSetCount}
  onIncrement={incrementSetCount}
/>
```

- `Card`, `Button`, `IconButton`, `Chip`, `Stepper`에 공통 API와 `glass` variant 제공
- 운동 기록, 결과, 프로틴과 설정 화면에서 플랫폼 조건 없이 같은 호출 구조 사용
- 화면이 플랫폼 구현 세부사항보다 사용자 흐름과 도메인 상태에 집중하도록 역할 분리

##### 2. 글래스 효과와 폴백을 하나의 표면으로 통합

```tsx
const IS_GLASS = isLiquidGlassAvailable()
const glassEffectEnabled = IS_GLASS && !reduceTransparencyEnabled

if (glassEffectEnabled) {
  return <GlassView glassEffectStyle="regular" />
}

return <View className="bg-yb-surface/95" />
```

- `GlassSurface`에서 테두리, 라운드와 콘텐츠 영역을 공통으로 관리
- 지원되는 iOS 26 환경에서는 `GlassView`, Android와 효과 미지원 환경에서는 React Native `View` 사용
- 투명도 감소 설정이 활성화되면 글래스 효과 대신 불투명에 가까운 표면으로 전환
- 접근성 설정 변경 이벤트를 구독해 실행 중에도 렌더링 방식 갱신

##### 3. 네이티브 차이가 필요한 컴포넌트만 플랫폼별로 분리

```text
Card.tsx          → SwiftUI Host · VStack · Text
Card.android.tsx  → React Native View · Text · Pressable
```

- 두 구현이 `Card.Row`, `Card.Title`, `Card.Metric`과 같은 compound API 제공
- Metro의 플랫폼 파일 해석을 사용해 호출부 변경 없이 렌더러 선택
- 프로틴 카드, 운동 부위 아이콘과 위치 지도도 같은 방식으로 필요한 경계만 분리

##### 4. 디자인 토큰으로 라이트·다크 모드 연결

- 시스템 테마에 따라 배경, 텍스트, 강조색과 글래스 테두리의 semantic token 변경
- React Native 스타일은 CSS 변수를 사용하고 SwiftUI와 네이티브 API에는 해석된 실제 색상값 전달
- 플랫폼별 렌더러가 서로 다른 UI 기술을 사용해도 같은 색상 기준 유지

#### 결과

- 화면별 플랫폼 조건과 중복 스타일 축소
- 지원되는 iOS 26 환경에서는 Liquid Glass, Android와 미지원 환경에서는 기본 표면 제공
- 투명도 감소 설정에 따라 글래스 효과를 고대비 기본 표면으로 전환
- 공통 디자인 토큰으로 라이트·다크 모드의 플랫폼별 표현 일관성 유지

---

### 3. React Native와 HealthKit을 연결한 양방향 브릿지 구축

> React Native가 운동 흐름을 관리하고 Swift가 HealthKit 세션을 제어하도록 나눈 뒤, 명령과 실시간 측정값을 양방향으로 연결했습니다.

#### 문제

React Native에서는 iPhone의 `HKWorkoutSession`과 `HKLiveWorkoutBuilder`를 직접 제어할 수 없어 운동 시작·복구·일시정지·재개·종료를 앱 상태와 연결하기 어려웠습니다. 심박수와 칼로리도 네이티브 delegate에서 전달되므로 JavaScript 화면까지 이어지는 별도의 이벤트 경계가 필요했습니다.

또한 Expo prebuild로 iOS 프로젝트를 다시 생성하면 직접 추가한 Swift 파일, HealthKit entitlement와 Live Activity Extension 설정이 사라질 수 있었습니다.

#### 양방향 브릿지를 선택한 이유

- HealthKit 샘플 조회만 사용: 과거 측정값은 읽을 수 있지만 실시간 운동 세션의 생명주기를 함께 제어하기 어려움
- 운동 화면 전체를 Swift로 구현: 네이티브 기능은 직접 사용할 수 있지만 React Native의 운동 상태와 UI가 이중화됨
- React Native와 Swift 브릿지: 사용자 흐름은 JavaScript에 유지하면서 세션 제어와 센서 수집만 네이티브에 위임 가능

로컬 운동 기록을 기준 데이터로 유지하고 HealthKit을 보강 경로로 두어, 권한 거부나 네이티브 오류가 운동 기록 자체를 막지 않도록 설계했습니다.

#### 구현 과정

##### 1. JavaScript의 운동 명령을 Swift 세션으로 전달

```objc
RCT_EXTERN_METHOD(start:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(pause:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(resume:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(end:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
```

- `WorkoutSession` 네이티브 모듈에 시작, 복구, 일시정지, 재개, 저장과 폐기 명령 노출
- React Native 모듈은 Promise와 이벤트 경계를 담당하고, 별도의 Swift controller가 HealthKit 세션과 builder 생명주기 관리
- 완료 시 `endCollection()`과 `finishWorkout()`으로 HealthKit 운동을 저장하고 workout UUID를 로컬 완료 기록에 연결

##### 2. Swift의 측정값을 React Native 이벤트로 전달

```swift
controller.onStats = { [weak self] stats in
  self?.sendEvent(
    withName: WorkoutSessionPayload.statsEventName,
    body: stats
  )
}
```

- HealthKit delegate가 수집한 심박수, 활동 칼로리와 총 칼로리를 `workoutStatsChanged` 이벤트로 발행
- TypeScript provider에서 네이티브 payload를 앱의 `WorkoutLiveStats` 형태로 정규화
- reducer가 `null` 심박수로 기존 값을 지우지 않고 칼로리가 이전 값보다 작아지지 않도록 보정

##### 3. 네이티브 이벤트가 늦거나 비어 있을 때 샘플 조회로 보강

```ts
return {
  ...nativeStats,
  heartRate: nativeStats.heartRate ?? sampledStats.heartRate,
  activeKcal: Math.max(nativeStats.activeKcal, sampledStats.activeKcal),
  totalKcal: Math.max(nativeStats.totalKcal, sampledStats.totalKcal),
}
```

- 네이티브 이벤트를 우선 사용하고 10초 동안 유효한 이벤트가 없으면 5초 간격의 HealthKit 샘플 조회 시작
- 센서 대기 또는 오류 상태에서는 샘플 조회를 즉시 시작
- iOS 26 미만이거나 live workout을 사용할 수 없는 환경에서도 샘플 기반 지표와 로컬 운동 기록 유지

##### 4. 앱 재실행 시 로컬 기록과 활성 HealthKit 세션 재연결

- 앱 종료 시 네이티브 세션을 즉시 저장하거나 폐기하지 않고 delegate와 메모리 참조만 정리
- React Native의 `recording` 스냅샷이 복구되면 iOS가 보유한 활성 workout session 복구 시도
- 활성 세션이 없거나 복구에 실패하면 새 세션 또는 샘플 조회 폴백으로 이어져 운동 흐름 유지
- HealthKit 일시정지·재개가 실패해도 로컬 운동 단계와 타이머는 계속 동작

##### 5. Expo config plugin으로 네이티브 설정 자동 등록

```js
fs.copyFileSync(sourcePath, destinationPath)

if (!project.hasFile(projectPath)) {
  project.addSourceFile(projectPath, { target }, appGroup)
}
```

- prebuild 시 Swift·Objective-C 파일을 복사하고 Xcode source reference를 중복 없이 등록
- HealthKit entitlement와 `NSSupportsLiveActivities` 설정 적용
- Live Activity Extension target, app target dependency와 embed 설정 정규화
- 앱 버전에 맞춰 Extension의 marketing version과 build number 동기화

#### 결과

- React Native에서 HealthKit 운동의 시작, 복구, 일시정지, 재개, 저장과 폐기를 하나의 흐름으로 제어
- 심박수와 활동·총 칼로리를 실시간 이벤트로 반영하고 샘플 조회 폴백으로 보강
- 앱 재실행 후 로컬 운동 기록과 iOS 활성 HealthKit 세션 재연결
- Expo prebuild 이후에도 브리지, HealthKit과 Live Activity 빌드 설정 자동 복원
- 권한 거부나 네이티브 오류가 발생해도 로컬 운동 기록 유지
