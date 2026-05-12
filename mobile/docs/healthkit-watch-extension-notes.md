# HealthKit Apple Watch 확장 메모

현재 구현은 AirPods Pro 3와 iPhone에서 지원되는 외부 심박 센서를
`iphoneLiveWorkout` provider로 처리한다.

Apple Watch 지원은 별도 `watchMirroredWorkout` provider로 추가한다. iPhone
provider에 Watch 전용 분기를 섞지 않는다.

추후 구현 범위:

- watchOS target 추가
- Apple Watch에서 `HKWorkoutSession` 시작
- Apple Watch의 `HKLiveWorkoutBuilder`로 심박수와 활동 칼로리 수집
- HealthKit remote workout session API로 iOS companion app에 workout mirror
- React Native 운동 화면은 계속 `WorkoutLiveStats`만 소비
- Watch 전용 상태가 필요하면 모든 provider에 적용 가능한 형태로 provider
  interface를 먼저 확장

참고 문서:

- Apple multidevice workout app:
  https://developer.apple.com/documentation/healthkit/building-a-multidevice-workout-app
- `HKWorkoutSession`:
  https://developer.apple.com/documentation/healthkit/hkworkoutsession
