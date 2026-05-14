# 운동 장소 도착 알림 기능서

> 현재 구현 기준으로 정리한 문서.  
> 범위: `완료 운동 위치 누적 → 반복 장소 판정 → 설정 화면 권한 동의 → geofence 등록 → 장소 도착 알림 → 운동 시작 확인`

## 1. 기능 목적

사용자가 2회 이상 운동을 완료한 장소 근처에 다시 도착하면 OS 로컬 알림으로 운동 시작을 제안한다.

이 기능은 운동 기록을 자동으로 시작하지 않는다. 알림을 누른 뒤 운동일지에서 확인 Alert를 띄우고, 사용자가 `운동 시작`을 선택해야 카운트다운으로 이동한다.

## 2. 장소 판정 기준

- 완료된 운동 세션에 `location`이 있는 경우만 장소 후보로 사용한다.
- 새 운동 위치가 기존 장소 중심점 기준 120m 이내면 같은 장소로 묶는다.
- 같은 장소에서 완료 운동이 2회 이상 쌓이면 geofence 등록 후보가 된다.
- 같은 장소로 묶을 때 중심점은 누적 평균으로 보정한다.
- 등록 후보가 많아지면 최근 운동일과 운동 횟수를 기준으로 최대 20개만 OS에 등록한다.
- 운동 기록을 삭제하면 남은 완료 세션 기준으로 장소 히스토리를 다시 만든다.

## 3. Geofence 등록

- geofence 반경은 150m다.
- `Location.startGeofencingAsync()`로 반복 운동 장소를 등록한다.
- `TaskManager.defineTask()`는 앱 번들 로드 시 전역 scope에서 등록된다.
- Enter 이벤트에서만 알림을 보내고, Exit 이벤트는 마지막 이벤트 상태만 저장한다.
- 장소 도착 알림 OFF 상태에서는 `Location.stopGeofencingAsync()`로 등록을 중지한다.
- 권한이 꺼진 자동 동기화에서는 사용자 enabled 값은 유지하고 실제 등록 가능 상태만 `operational: false`로 저장한다.

## 4. 권한 원칙

- 설정 화면에서 사용자가 `운동 장소 도착 알림`을 ON 하는 명시적 액션에서만 권한을 요청할 수 있다.
- 요청 가능한 권한은 알림 권한, foreground 위치 권한, background 위치 권한이다.
- Android 11+에서는 background location 권한 요청 시 시스템 설정 화면으로 이동한다. 앱은 설정 화면으로 보내기 전에 백그라운드 위치가 필요한 이유를 Alert로 설명한다.
- 앱 시작, 운동 완료, 운동 기록 삭제 후 재동기화는 권한 상태만 확인한다.
- 자동 동기화 경로는 OS 권한 프롬프트를 띄우지 않는다.
- 자동 동기화에서 알림 또는 위치 권한이 꺼져 있으면 geofence 등록을 중지하고 동기화 상태에 권한 실패를 저장한다.

## 5. 알림 규칙

- 같은 장소는 하루 1회만 알림을 보낸다.
- 알림 제목은 `운동 장소 근처에 도착했어요`다.
- 알림 본문은 `운동을 시작하시겠어요?`다.
- 알림 data에는 `type: "workout-place-arrival"`과 `placeId`만 포함한다.
- 알림에는 주소, 좌표, 운동 기록 상세를 포함하지 않는다.
- OS geofence 이벤트에 의존하므로 알림이 지연되거나 전달되지 않을 수 있다.

## 6. 알림 탭 동작

- 알림을 누르면 앱을 열고 운동일지 화면으로 이동한다.
- 운동일지 화면은 pending prompt를 읽고 확인 Alert를 표시한다.
- Alert의 `나중에`를 누르면 pending prompt를 삭제하고 아무 동작도 하지 않는다.
- Alert의 `운동 시작`을 누르면 pending prompt를 삭제한다.
- 진행 중 운동이 없으면 `/workout/countdown`으로 이동한다.
- 이미 진행 중인 운동이 있으면 `/workout/active`로 이동한다.

## 7. 저장 키

- `yb:workout-place-reminder:enabled`
  - 값: `"true"` / `"false"`
- `yb:workout-place-reminder:places`
  - 값: 반복 운동 장소 후보 배열(JSON)
- `yb:workout-place-reminder:pending-prompt`
  - 값: 알림 탭 후 운동일지에서 표시할 pending prompt(JSON)
- `yb:workout-place-reminder:sync-status`
  - 값: enabled, operational, 권한 상태, 등록 region, 마지막 geofence 이벤트 상태(JSON)
