# Page Specs

`docs/page`는 화면별 기능서를 관리한다.

## Source of Truth

- `*.md`가 canonical source다. 에이전트는 화면 동작을 이해할 때 md를 먼저 읽는다.
- `*.html`은 사람이 보기 좋게 만든 열람용 문서다. HTML 안에만 존재하는 스펙, 코드 갭, 제약사항을 추가하지 않는다.
- md/html 내용이 충돌하면 항상 md를 기준으로 판단한다.
- HTML에서 새로 발견한 갭이나 보정 정보는 먼저 같은 이름의 `.md`에 반영한다.
- HTML은 사용자 가시성을 위한 산출물이므로 Tailwind, Mermaid, nav, script 같은 표현 코드가 있어도 에이전트용 기준 문서로 삼지 않는다.

## 화면 매핑

| 화면 | Canonical md | Human view |
| --- | --- | --- |
| 메인/일지 | `01_main.md` | `01_main.html` |
| 운동 결과 | `02_result.md` | `02_result.html` |
| 캘린더 | `03_calendar.md` | `03_calendar.html` |
| 세션 목록 | `04_sessions.md` | `04_sessions.html` |
| 운동 실행 | `05_workout.md` | `05_workout.html` |
| 템포 | `06_tempo.md` | `06_tempo.html` |
| 알림 | `07_notification.md` | `07_notification.html` |
| 설정 | `08_settings.md` | `08_settings.html` |
| 운동 장소 도착 알림 | `09_workout_place_reminder.md` | `09_workout_place_reminder.html` |

## 갱신 규칙

- 화면 동작을 바꾸면 관련 md의 현재 동작, 제약, 코드 근거를 먼저 갱신한다.
- HTML을 갱신할 때는 같은 md와 내용이 충돌하지 않는지 확인한다.
- HTML만 고치는 변경은 표현 개선으로만 제한한다.
