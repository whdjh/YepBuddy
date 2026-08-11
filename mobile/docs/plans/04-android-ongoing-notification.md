# 04. Android 운동 중 ongoing notification

> 상태: 대기  
> 선행 문서: [`03-android-design-refactor.md`](./03-android-design-refactor.md)  
> 후속 문서: [`05-cloud-backup-restore.md`](./05-cloud-backup-restore.md)  
> 완료 판정: Android 13 이상 실기기 검증 필요

## 목표

Android 사용자가 앱이 백그라운드에 있을 때 알림창에서 운동 상태와 경과 시간을 확인하고 일시정지, 재개, 종료를 실행할 수 있게 한다.

## 사용자 동작

| 현재 상태 | 표시 action |
| --- | --- |
| 기록 중 | 일시정지, 운동 종료 |
| 일시정지 | 재개, 운동 종료 |

알림 본문을 누르면 현재 운동 화면을 연다. 알림 권한이 없거나 channel이 꺼져 있어도 앱 안의 운동 기록은 정상 동작해야 한다.

## 포함 범위

- Kotlin `NotificationCompat` ongoing notification
- 동일 notification ID를 사용한 시작·갱신·종료
- 저소음 channel과 system chronometer
- 명시적 receiver와 안전한 `PendingIntent`
- `pause`, `resume`, `finish` command
- command ID, session ID, 생성 시각을 가진 durable queue
- TypeScript 소비·중복 제거와 config plugin 기반 native 생성

## 제외 범위

- foreground service
- 센서, Health Connect, 심박수와 칼로리 표시
- 알림에서 세트·메모 수정
- Android 최신 버전 전용 promoted UI를 필수 경로로 사용
- 앱 프로세스를 즉시 깨워 완료 기록을 강제로 생성하는 headless 작업

## 순차 체크리스트

### A. 계약 고정

- [ ] `04-01` `docs/page/05_workout.md`와 `docs/page/07_notification.md`에 목표 동작을 먼저 반영한다.
- [ ] `04-02` notification snapshot의 session ID, 상태, 시작 시각, 누적 일시정지 시간을 정의한다.
- [ ] `04-03` command의 ID, session ID, 종류, 생성 시각과 ack 규칙을 정의한다.
- [ ] `04-04` 현재 session과 일치하는 command만 한 번 적용하는 순수 테스트를 만든다.

### B. 기본 알림

- [ ] `04-05` Android 8 이상용 저소음 channel을 만든다.
- [ ] `04-06` 기록 중·일시정지 상태와 system chronometer를 렌더링한다.
- [ ] `04-07` 같은 notification ID로 상태를 갱신하고 완료·폐기 시 제거한다.
- [ ] `04-08` 본문 탭이 `/workout/active`를 연다.
- [ ] `04-09` Android 13 이상 권한 거부가 운동 시작을 막지 않게 한다.

### C. action과 command queue

- [ ] `04-10` action별 explicit receiver와 고유 request code를 만든다.
- [ ] `04-11` `PendingIntent` mutability와 update 정책을 명시한다.
- [ ] `04-12` receiver가 알림 UI를 즉시 갱신하고 command를 native 저장소에 보존한다.
- [ ] `04-13` TypeScript가 hydration 뒤 command를 시간순으로 소비하고 성공 후 ack한다.
- [ ] `04-14` 오래된 session, 중복 ID, 이미 완료된 session의 command를 무시한다.
- [ ] `04-15` `finish`가 알림을 즉시 제거하고 완료 저장을 정확히 한 번 이어간다.

### D. 반복 가능한 native 설정

- [ ] `04-16` Kotlin 원본과 bridge를 `plugins/android/` 아래 source of truth로 둔다.
- [ ] `04-17` config plugin이 module, receiver, channel 관련 manifest 항목을 생성한다.
- [ ] `04-18` plugin을 두 번 실행해도 source와 manifest가 중복되지 않는다.
- [ ] `04-19` 앱 재시작 시 복원된 현재 운동과 미처리 command를 먼저 처리한 뒤 알림을 동기화한다.
- [ ] `04-20` 실제 검증 결과에 맞춰 두 canonical 화면 기능서를 최종 대조한다.

## 자동 검증 게이트

- [ ] snapshot·command 정규화, 세션 일치, 중복 제거 테스트가 통과한다.
- [ ] config plugin 반복 실행과 manifest 계약 검사가 통과한다.
- [ ] `bun x tsc --noEmit`과 `bun run lint`가 통과한다.
- [ ] Android debug/release build가 통과한다.
- [ ] 에뮬레이터에서 시작·일시정지·재개·종료와 권한 거부를 검증한다.

## 실기기 검증 게이트

- [ ] Android 13 이상에서 알림 권한 허용·거부를 검증한다.
- [ ] foreground, background, 화면 잠금, 프로세스 재생성을 검증한다.
- [ ] 알림 chronometer와 앱 타이머가 같은 기준을 사용한다.
- [ ] 종료가 한 번만 저장되고 앱 재실행 후 알림이 다시 생기지 않는다.
- [ ] 오래된 session의 action이 현재 운동을 변경하지 않는다.

## 실행 기록

| 날짜 | 체크 항목 | 결과 | 명령·기기·증거 |
| --- | --- | --- | --- |
| - | - | - | - |
