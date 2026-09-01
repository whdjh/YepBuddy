# YepBuddy Mobile

운동 기록과 루틴 진행, 운동 템포, 프로틴 가격 확인을 제공하는 Expo와 React Native 기반 iOS 및 Android 피트니스 앱입니다.

운동 중 앱이 종료되어도 진행 상태를 복구하고, iOS에서는 HealthKit 운동 세션의 심박수와 칼로리를 운동 화면에 반영합니다.

[서비스 바로가기](https://yepbuddy.netlify.app/)

## 전체 아키텍처

![YepBuddy Mobile 전체 아키텍처](./docs/assets/mobile-architecture.png)

---

## 핵심 구현

### 앱 강제 종료 후 진행 중 운동 세션 복원

> 진행 중인 운동을 로컬 스냅샷으로 저장하고, 앱 재실행 시 useReducer 상태로 복원해 기존 운동을 이어서 기록합니다.

#### 문제

운동 중 앱을 강제 종료하면 메모리에 있던 운동 부위, 세트 수, 메모와 일시정지 상태가 사라졌습니다. 앱을 다시 실행했을 때 단순히 운동 화면을 여는 것이 아니라 종료 전 상태와 경과 시간을 함께 복원해야 했습니다.

#### 핵심 선택

운동 단계와 관련 정보를 하나의 reducer 상태로 관리하고, 진행 중 상태를 AsyncStorage에 저장했습니다. 앱 시작 직후에는 초기 상태를 저장하지 않고 기존 스냅샷 조회를 먼저 완료해 남아 있던 운동 기록이 덮이는 것을 막았습니다.

```tsx
const [isHydrated, setIsHydrated] = useState(false)

useEffect(() => {
  let mounted = true

  void loadCurrentWorkoutSnapshot<WorkoutState>().then((snapshot) => {
    if (!mounted) return

    if (snapshot) {
      dispatch({ type: "HYDRATE", payload: snapshot })
    }
    setIsHydrated(true)
  })

  return () => {
    mounted = false
  }
}, [dispatch])

useEffect(() => {
  if (!isHydrated) {
    return
  }

  saveRecoverableWorkoutSnapshot()
}, [
  isHydrated,
  saveRecoverableWorkoutSnapshot,
  state.bodyParts,
  state.cardioStartedAt,
  state.completedAt,
  state.location,
  state.pausedAt,
  state.pausedDuration,
  state.phase,
  state.sessionId,
  state.startedAt,
])
```

복구가 끝난 이후부터 운동 상태 변경을 다시 저장합니다. 복원된 단계가 진행 중이거나 일시정지 상태라면 운동 화면으로 이동해 저장된 운동 부위, 세트 수와 메모를 그대로 이어서 사용합니다.

타이머 숫자는 저장하지 않고 시작 시각과 일시정지 정보를 기준으로 다시 계산했습니다. 이를 통해 운동 중 앱이 종료된 시간은 운동 시간에 포함하고, 일시정지 중 종료된 시간은 제외합니다.

```ts
return Math.max(
  0,
  nowMs - startedAtMs - pausedDuration - Math.max(pausedSegmentMs, 0),
)
```

#### 결과

- 앱 강제 종료 후 진행 중이거나 일시정지된 운동 상태 복원
- 복원 완료 전 저장을 차단해 기존 스냅샷이 초기 상태로 덮이는 문제 방지
- 저장된 시각으로 경과 시간을 다시 계산해 운동 타이머의 연속성 유지
- 완료 운동 저장에 성공한 뒤 진행 중 스냅샷을 삭제해 기록 유실 방지

---

### React Native와 HealthKit 운동 세션 연동

> 운동 제어 명령은 요청과 응답 방식으로 전달하고, 지속적으로 변경되는 세션 상태와 측정값은 이벤트로 받아 운동 화면에 반영합니다.

#### 문제

React Native만으로는 HealthKit 운동 세션을 직접 제어할 수 없습니다. 앱의 운동 흐름에서 세션을 시작하고 일시정지하거나 종료하는 경로와, HealthKit이 수집한 심박수와 칼로리를 화면으로 전달하는 경로가 모두 필요했습니다.

#### 핵심 선택

HealthKit 세션 제어는 iOS 네이티브 영역에 두고 React Native는 사용자 흐름과 운동 화면 상태를 관리하도록 역할을 나눴습니다. 결과가 한 번 필요한 운동 명령은 Promise로 처리하고, 운동 중 계속 변경되는 측정값은 이벤트로 전달했습니다.

```ts
interface NativeWorkoutSessionModule {
  start: () => Promise<NativeWorkoutStartResult | boolean>
  recover: () => Promise<NativeWorkoutStartResult | boolean>
  pause: () => Promise<boolean>
  resume: () => Promise<boolean>
  end: () => Promise<NativeWorkoutEndResult | boolean>
}

const subscription = nativeEmitter.addListener(
  "workoutStatsChanged",
  (payload: Partial<WorkoutLiveStats>) => {
    listener(
      normalizeWorkoutLiveStats({
        ...payload,
        source: "iphoneLiveWorkout",
      }),
    )
  },
)
```

React Native에서 시작, 복구, 일시정지, 재개와 종료 명령을 전달하면 네이티브 영역이 HealthKit 세션을 제어하고 실행 결과를 반환합니다. 반대 방향에서는 새로운 심박수와 칼로리가 수집될 때 이벤트를 발행하고, React Native가 이를 구독해 운동 화면에 반영합니다.

#### 결과

- React Native의 운동 흐름에서 HealthKit 운동 세션 제어
- 심박수와 칼로리를 이벤트로 받아 운동 화면에 실시간 반영
- 네이티브 세션 제어와 React Native 화면 상태의 책임 분리
