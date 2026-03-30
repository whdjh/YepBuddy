# 9. 잠금화면 위젯

<aside>
⚙️

- **타입:** iOS 잠금화면 위젯 (WidgetKit)
- **구현:** Swift/SwiftUI로 별도 Widget Extension 구현. React Native 영역 밖.
- **데이터 소스:** HealthKit에서 직접 조회. 앱과 데이터를 공유하지 않고 위젯이 독립적으로 HealthKit에 접근한다.
- **갱신:** iOS 타임라인 기반. 시스템이 주기적으로 위젯을 갱신한다.
</aside>

## 9.1. 화면 구성

- **위젯 사이즈:** Medium (가로 직사각형) — *정확한 사이즈는 추후 확정*
- **컨셉:** GitHub 잔디(커밋 기록) 스타일

### 월별 운동 기록 그리드

- 월 단위 캘린더 그리드에 해당 날짜의 운동 여부를 아이콘으로 표시한다.
- 운동한 날: 꽃/도형 아이콘 (채워짐)
- 운동 안 한 날: 빈 아이콘 또는 미표시
- 아이콘 표시 로직: 운동함 / 안함 2단계만. GitHub 잔디처럼 농도 차이 없음.

### 하단 정보

- 연간 남은 일수

## 9.2. 데이터 조회

1. **HealthKit 조회**
    - Widget Extension이 HealthKit에 직접 접근하여 현재 월의 `HKWorkout` 샘플 존재 여부를 날짜별로 조회한다.
2. **HealthKit 권한**
    - Widget Extension도 HealthKit 읽기 권한이 필요하다.
    - 앱 본체에서 HealthKit 권한을 받으면 Widget Extension에서도 접근 가능하다. (동일 App Group 내)

## 9.3. 타임라인 갱신

- iOS `TimelineProvider`를 사용하여 시스템이 주기적으로 위젯을 갱신한다.
- 앱에서 운동이 종료될 때 `WidgetCenter.shared.reloadAllTimelines()`를 호출하여 위젯 즉시 갱신을 트리거한다.

## 9.4. 탭 동작

- 위젯 탭 시 앱 메인화면(요약)으로 이동한다.

## 9.5. 엣지케이스

1. **세션이 0건인 사용자**
    - 모든 날짜가 빈 아이콘으로 표시된다.
2. **HealthKit 권한 거부**
    - 운동 유무를 판단할 수 없으므로 모든 날짜가 빈 아이콘으로 표시된다.
3. **앱 미설치 상태에서 위젯 추가**
    - 위젯은 앱이 설치되어 있어야 추가 가능하므로 해당 없음.

## 9.6. 기술 구현

| 항목 | 내용 |
|------|------|
| 프레임워크 | WidgetKit + SwiftUI |
| 데이터 | HealthKit (Widget Extension에서 직접 접근) |
| 갱신 트리거 | iOS 타임라인 + 앱에서 `WidgetCenter.reloadAllTimelines()` |

<aside>
📌

**미확정 항목**

- 위젯 정확한 사이즈
- 아이콘 디자인 (꽃/도형 구체적 형태)
</aside>

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-30 | 잠금화면 위젯 명세서 초안 작성 |
