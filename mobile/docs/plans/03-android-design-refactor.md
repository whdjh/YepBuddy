# 03. Android 디자인 리팩터링

> 상태: 대기  
> 선행 문서: [`02-result-heart-rate-chart.md`](./02-result-heart-rate-chart.md)  
> 후속 문서: [`04-android-ongoing-notification.md`](./04-android-ongoing-notification.md)  
> 완료 판정: Android 에뮬레이터 screenshot matrix와 실기기 검증 필요

## 목표

기능과 데이터 흐름을 바꾸지 않고 Android 화면을 YepBuddy 디자인 토큰과 플랫폼 동작에 맞게 정리한다. 공용 UI부터 수정해 화면별 중복 변경을 줄인다.

## 포함 범위

- 현재 사용자가 접근할 수 있는 Android 화면
- 공용 Card, Button, Chip, Icon, 입력, modal, bottom sheet
- safe area, system bar, keyboard, hardware back
- NativeWind와 현재 디자인 토큰
- 최소 44px 터치 영역, font scaling, ko/en, light/dark

## 제외 범위

- 사용자 흐름과 저장 계약 변경
- iOS 시각 변경
- 신규 기능 추가
- 접근할 수 없는 숨김 화면의 선제 리팩터링
- 디자인 토큰과 무관한 대규모 컴포넌트 재설계

## 화면 처리 순서

1. 공용 primitive
2. 앱 shell·탭·헤더
3. 단순 조회 화면
4. 입력·설정·modal·bottom sheet
5. 운동 진행·결과 복합 화면

## 순차 체크리스트

### A. 기준 캡처와 규칙

- [ ] `03-01` 지원 Android API·화면 크기·font scale 검증 matrix를 정한다.
- [ ] `03-02` 모든 접근 가능 화면의 변경 전 screenshot을 저장한다.
- [ ] `03-03` 화면별 간격, 색상, radius, overflow, 터치 영역 문제를 목록화한다.
- [ ] `03-04` `.codex/design-tokens.md`와 `.codex/design-principles.md` 기준으로 기대값을 고정한다.

### B. 공용 UI

- [ ] `03-05` `src/shared/README.md`를 읽고 수정할 shared public API를 확정한다.
- [ ] `03-06` Card·Button·IconButton·Chip의 크기와 상태를 Android에서 맞춘다.
- [ ] `03-07` 입력, textarea, stepper의 키보드·focus·disabled 상태를 맞춘다.
- [ ] `03-08` modal과 bottom sheet의 radius, dim, safe-area, 닫기 동작을 맞춘다.
- [ ] `03-09` 플랫폼 차이가 실제로 필요한 컴포넌트만 `.android.tsx`로 분리한다.

### C. 화면별 적용

- [ ] `03-10` 앱 shell, tab bar, header, SettingsFab과 system bar를 정리한다.
- [ ] `03-11` 요약·세션·캘린더 같은 조회 화면을 정리한다.
- [ ] `03-12` 프로틴 목록·상세와 설정 화면을 정리한다.
- [ ] `03-13` countdown과 운동 진행 화면을 정리한다.
- [ ] `03-14` 운동 결과 화면과 편집 bottom sheet를 정리한다.
- [ ] `03-15` hardware back, deep link, keyboard open 상태에서 화면 이탈을 검증한다.

### D. 회귀 확인

- [ ] `03-16` 각 화면을 관련 `docs/page/*.md`와 대조한다.
- [ ] `03-17` ko/en과 light/dark 조합에서 잘림·대비·overflow를 확인한다.
- [ ] `03-18` 작은 화면과 큰 font scale에서 주요 action이 접근 가능하다.
- [ ] `03-19` 변경 후 screenshot을 기준 캡처와 비교하고 남은 예외를 기록한다.
- [ ] `03-20` 새 토큰이나 공용 패턴이 생겼다면 shared 가이드와 토큰 문서를 갱신한다.

## 자동 검증 게이트

- [ ] `bun x tsc --noEmit`과 `bun run lint`가 통과한다.
- [ ] 수정된 UI에 StyleSheet, `flex-1`, FSD 역방향 import가 없다.
- [ ] Android debug/release build가 통과한다.
- [ ] 에뮬레이터의 light/dark, ko/en, 작은/큰 화면 캡처가 생성된다.
- [ ] 핵심 route와 press 동작 smoke test가 통과한다.

## 실기기 검증 게이트

- [ ] Android 실기기 1대 이상에서 system bar와 제스처 영역을 확인한다.
- [ ] 키보드, font scale, hardware back, 스크롤을 확인한다.
- [ ] modal·bottom sheet의 열기/닫기와 터치 영역을 확인한다.
- [ ] 디자인 변경 전후 핵심 기능이 동일하게 동작한다.

## 실행 기록

| 날짜 | 체크 항목 | 결과 | 캡처·기기·증거 |
| --- | --- | --- | --- |
| - | - | - | - |
