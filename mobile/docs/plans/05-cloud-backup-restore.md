# 05. Node.js·Supabase Auth·서버 백업·새 기기 복원

> 상태: 대기  
> 선행 문서: [`04-android-ongoing-notification.md`](./04-android-ongoing-notification.md)  
> 후속 문서: 없음  
> 완료 판정: 개발·운영 DB, 두 사용자 격리, 실제 새 설치 복원 검증 필요

## 목표

로그인하지 않은 로컬 사용을 유지하면서, 로그인한 사용자는 완료 운동과 허용된 설정을 서버에 백업하고 새 기기에서 안전하게 복원할 수 있게 한다.

## 참고 설계에서 유지한 원칙

삭제 전 참고한 기존 backend 설계의 프로틴 도메인 내용은 가져오지 않고 다음 운영 원칙만 일반화했다.

- DB는 모바일 저장 키가 아니라 백업 도메인 의미로 설계한다.
- API는 화면·백업 흐름에 필요한 DTO만 반환하고 DB row를 그대로 노출하지 않는다.
- Node.js 서버는 controller → service → repository → DTO/validation 경계를 가진다.
- PostgreSQL 변경은 번호가 붙은 migration SQL로 관리한다.
- 새 저장 경로를 검증하기 전에 기존 로컬 데이터를 삭제하지 않는다.
- 재시도 가능한 쓰기는 unique key와 transaction으로 멱등성을 보장한다.

## 제품 결정

- 로그인은 선택 사항이며 로컬 운동 기록은 항상 가능하다.
- Supabase Auth가 회원가입, 로그인, 세션 갱신을 담당한다.
- 모바일은 publishable key만 사용하고 service-role key를 포함하지 않는다.
- Node.js API는 bearer token을 검증하고 token의 사용자 ID만 신뢰한다.
- 서버는 로컬 기록의 복구용 복사본이며 1차 범위에서 실시간 다중 기기 편집은 지원하지 않는다.
- 서버 백업 대상은 완료 세션과 복원 가능한 설정의 allowlist로 제한한다.
- 인증 token, push token, 캐시, 기기 권한 상태, 위치 원본과 개별 심박수 샘플은 백업하지 않는다.

## 최소 API

| Method | Path | 역할 |
| --- | --- | --- |
| `GET` | `/v1/backups/current` | 로그인 사용자의 최신 백업 조회 |
| `PUT` | `/v1/backups/current` | base revision을 확인하고 현재 백업 저장 |
| `DELETE` | `/v1/account` | 재인증된 사용자의 백업과 계정 삭제 작업 시작 |

별도 restore mutation은 만들지 않는다. 모바일이 `GET` 응답을 임시 영역에서 검증한 뒤 로컬에 원자적으로 적용한다.

## 순차 체크리스트

### A. 백업 계약

- [ ] `05-01` 백업 포함·제외 allowlist를 확정한다.
- [ ] `05-02` 로컬 schema와 server backup DTO의 version·migration 규칙을 확정한다.
- [ ] `05-03` revision, checksum, idempotency key와 `409 Conflict` 정책을 정의한다.
- [ ] `05-04` 성공, 빈 백업, 401, 409, 413, 422 응답 fixture를 만든다.
- [ ] `05-05` restore 실패 시 기존 로컬 데이터를 그대로 유지하는 원자적 적용 규칙을 정의한다.

### B. Supabase Auth 모바일 흐름

- [ ] `05-06` 현재 공식 React Native 세션 저장 방식과 deep-link 요구를 다시 확인한다.
- [ ] `05-07` 회원가입, 로그인, 로그아웃, 세션 만료, 비밀번호 재설정 흐름을 구현한다.
- [ ] `05-08` 로그인 전 로컬 기록의 소유권 처리 방식을 사용자에게 명시한다.
- [ ] `05-09` 사용자 전환 시 이전 사용자의 로컬 cache가 노출되지 않게 한다.
- [ ] `05-10` access token만 `Authorization: Bearer`로 Node.js API에 전달한다.

### C. PostgreSQL migration과 RLS

- [ ] `05-11` 최소 `user_backups`와 필요한 idempotency 저장 구조를 migration으로 만든다.
- [ ] `05-12` user ID, revision, schema version, checksum, payload size와 timestamp constraint를 둔다.
- [ ] `05-13` `auth.uid()` 기준 RLS 정책과 사용자별 조회 index를 만든다.
- [ ] `05-14` clean DB migration과 rollback·재적용 절차를 검증한다.
- [ ] `05-15` 기존 운영 table을 삭제하지 않고 새 schema를 병렬 검증한다.

### D. Node.js API

- [ ] `05-16` 최소 Node.js/NestJS 모듈과 환경 변수 validation을 구성한다.
- [ ] `05-17` auth guard가 Supabase가 검증한 실제 사용자 principal을 만든다.
- [ ] `05-18` body·query의 user ID를 신뢰하지 않고 token 사용자만 repository에 전달한다.
- [ ] `05-19` DTO validation, body size 제한, rate limit, DB timeout을 적용한다.
- [ ] `05-20` 최초 저장, 동일 요청 재시도, revision 갱신과 stale 충돌을 transaction으로 처리한다.
- [ ] `05-21` access token, 전체 payload와 건강 데이터를 로그에 남기지 않는다.

### E. 모바일 백업·복원

- [ ] `05-22` canonical 로컬 데이터에서 allowlist backup DTO와 checksum을 만든다.
- [ ] `05-23` 업로드 성공 뒤에만 local last-backed-up revision을 갱신한다.
- [ ] `05-24` 네트워크 실패가 로컬 운동 저장을 막지 않게 한다.
- [ ] `05-25` 새 설치에서 로그인 → GET → 검증 → migration → 원자적 저장 → index 재구축을 수행한다.
- [ ] `05-26` 지원하지 않는 schema와 손상 checksum을 적용하지 않는다.
- [ ] `05-27` 계정 삭제와 단순 로그아웃의 데이터 처리를 구분한다.

### F. 운영과 전환

- [ ] `05-28` service-role과 서버 secret이 모바일 bundle과 저장소에 없는지 검사한다.
- [ ] `05-29` health/readiness, request ID, 상태 코드, latency, payload 크기 관측을 추가한다.
- [ ] `05-30` migration → backward-compatible API → 모바일 순으로 배포한다.
- [ ] `05-31` 개발 DB 백업과 정기 restore drill 절차를 기록한다.
- [ ] `05-32` 실제 새 설치·같은 계정 복원을 검증한 뒤에만 전환 완료를 선언한다.

## 자동 검증 게이트

- [ ] 정상·누락·만료·변조 token이 각각 기대한 인증 결과를 낸다.
- [ ] 사용자 A가 사용자 B의 백업을 읽거나 쓸 수 없다.
- [ ] 동일 idempotency key 재시도에서 중복 저장이 없다.
- [ ] stale revision은 기존 백업을 보존하고 `409`를 반환한다.
- [ ] PUT → GET round trip이 canonical fixture와 일치한다.
- [ ] 손상·구버전 payload의 migration 또는 거부 테스트가 통과한다.
- [ ] 모바일 산출물 secret scan이 통과한다.

## 실환경 검증 게이트

- [ ] iOS와 Android에서 Supabase 세션 생성·갱신·로그아웃을 검증한다.
- [ ] 네트워크 중단 중 로컬 기록 후 재연결 백업을 검증한다.
- [ ] 새 설치 또는 새 기기에서 같은 계정으로 전체 복원을 검증한다.
- [ ] 계정 삭제 후 기존 token으로 보호 API에 접근할 수 없다.
- [ ] 복원 실패가 기존 로컬 기록을 손상시키지 않는다.

## 최신 문서 기준

- Supabase React Native Auth는 session persistence와 token auto-refresh를 명시적으로 구성한다.
- RLS가 켜진 클라이언트에는 publishable key만 사용하며 service-role key는 절대 포함하지 않는다.
- Node.js/NestJS는 bearer token guard와 DTO validation을 공통 경계로 적용한다.

구현 시점에는 Context7로 Supabase와 NestJS 공식 문서를 다시 조회한다.

## 실행 기록

| 날짜 | 체크 항목 | 결과 | 환경·명령·증거 |
| --- | --- | --- | --- |
| - | - | - | - |
