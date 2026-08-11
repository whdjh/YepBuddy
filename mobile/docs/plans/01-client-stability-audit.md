# 01. 클라이언트 안정성 감사 및 수정

> 상태: 대기  
> 선행 문서: 없음  
> 후속 문서: [`02-result-heart-rate-chart.md`](./02-result-heart-rate-chart.md)  
> 완료 판정: 자동 검증과 iOS·Android 실기기 검증 필요

## 목표

진행 중 운동과 완료 기록이 앱 종료, 저장 실패, 권한 거부, 네이티브 연동 실패 뒤에도 유실되거나 중복되지 않게 한다. 서버 백업을 시작하기 전에 로컬 데이터 계약과 빌드 재현성을 고정한다.

## 포함 범위

- 현재 운동 상태의 저장·복원·손상 데이터 처리
- 완료 세션 본문과 날짜 인덱스 정합성
- 완료 처리의 중복 방지와 실패 후 재시도
- HealthKit 세션의 시작·일시정지·재개·종료·폐기·복구
- 운동 리마인더, 장소 알림, 캘린더 후처리의 실패 격리
- Bun, Expo config, config plugin, EAS, iOS·Android 빌드 재현성

## 제외 범위

- 화면 디자인 변경
- 결과 심박수 그래프 개선
- Android 운동 중 ongoing notification 신규 구현
- 로그인, 서버 API, 백업·복원

## 순차 체크리스트

### A. 기준선 고정

- [ ] `01-01` 관련 `docs/page/*.md`와 entity·feature 가이드를 읽고 현재 동작 표를 만든다.
- [ ] `01-02` AsyncStorage 키, 저장 schema, native side effect, config plugin과 빌드 설정 목록을 만든다.
- [ ] `01-03` 정상·손상·구버전 현재 운동 및 완료 세션 fixture를 고정한다.
- [ ] `01-04` `bun x tsc --noEmit`, `bun run lint`, 기존 plugin 검사 명령의 초기 결과를 기록한다.

### B. 현재 운동 저장·복원

- [ ] `01-05` 현재 운동 snapshot에 schema version과 runtime parser를 둔다.
- [ ] `01-06` phase별 필수 필드, 날짜, 숫자, 배열의 불변조건을 검증한다.
- [ ] `01-07` 손상되거나 지원하지 않는 snapshot을 격리하고 hydration은 정상 종료한다.
- [ ] `01-08` `recording`과 `paused` 상태에서 앱 강제 종료 후 같은 세션을 복원한다.
- [ ] `01-09` hydration 완료 전 새 운동 시작과 중복 countdown 전이를 차단한다.
- [ ] `01-10` debounce write와 clear 경합이 삭제한 snapshot을 되살리지 않게 한다.

### C. 완료 기록과 인덱스

- [ ] `01-11` 완료 세션 parser가 ID, 시작·완료 시각, 부위, 세트 수와 선택 필드를 검증한다.
- [ ] `01-12` 세션 본문 저장이 성공한 뒤 날짜 인덱스를 갱신한다.
- [ ] `01-13` stale 또는 누락된 날짜 인덱스를 세션 본문에서 재구축한다.
- [ ] `01-14` 같은 날 여러 운동이 목록·캘린더·요약에서 각각 유지된다.
- [ ] `01-15` 동시 종료와 재시도에도 완료 세션이 정확히 한 번만 저장된다.
- [ ] `01-16` 완료 후처리를 멱등 단계로 나누고 중단된 단계를 재개한다.

### D. HealthKit과 기기 side effect

- [ ] `01-17` HealthKit 시작 실패가 로컬 운동 시작을 막지 않는지 검증한다.
- [ ] `01-18` pause·resume·end·discard 실패가 로컬 상태를 되돌리지 않는지 검증한다.
- [ ] `01-19` HealthKit workout UUID와 평균 심박수가 정확한 완료 세션에 저장된다.
- [ ] `01-20` 앱 복구 시 기존 native 세션의 소유권과 종료 경로를 검증한다.
- [ ] `01-21` 캘린더·리마인더·장소 알림 실패를 완료 기록 저장과 분리한다.
- [ ] `01-22` 알림 예약 ID와 실제 OS 예약 목록을 대조하고 불일치를 복구한다.

### E. 빌드 재현성

- [ ] `01-23` package manager를 Bun으로 통일하고 lockfile·EAS 설정 충돌을 제거한다.
- [ ] `01-24` 필요한 test script를 추가하거나 실제 실행 명령을 이 문서에 기록한다.
- [ ] `01-25` config plugin을 두 번 실행해도 파일·target·manifest 항목이 중복되지 않는다.
- [ ] `01-26` clean Expo prebuild에서 native source가 동일하게 재생성된다.
- [ ] `01-27` Android debug/release와 iOS simulator build 결과를 기록한다.
- [ ] `01-28` 실제 검증 결과에 맞춰 canonical 화면 기능서와 layer 가이드를 갱신한다.

## 자동 검증 게이트

- [ ] TypeScript와 lint가 통과한다.
- [ ] snapshot parser, reducer, 완료 처리, 인덱스 재구축 fixture 테스트가 통과한다.
- [ ] 저장·삭제·권한·native 호출 실패 주입 테스트가 통과한다.
- [ ] workout-session plugin 계약 검사가 통과한다.
- [ ] clean prebuild와 Android/iOS 빌드 결과가 기록된다.

## 실기기 검증 게이트

- [ ] iPhone에서 시작 → 백그라운드 → 강제 종료 → 복원 → 완료를 검증한다.
- [ ] iPhone에서 HealthKit 허용·거부와 저장 1회 여부를 검증한다.
- [ ] Android에서 동일한 로컬 복원·완료 흐름을 검증한다.
- [ ] Android와 iPhone에서 알림·캘린더·위치 권한 허용·거부를 검증한다.

실기기가 없어 자동 검증만 끝난 경우 상태를 `자동 검증 완료`로 기록하고 전체 완료로 표시하지 않는다.

## 실행 기록

| 날짜 | 체크 항목 | 결과 | 명령·기기·증거 |
| --- | --- | --- | --- |
| - | - | - | - |
