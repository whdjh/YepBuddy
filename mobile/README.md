# YepBuddy Mobile

YepBuddy의 Expo/React Native 모바일 앱입니다.

운동일지, 운동 템포, 프로틴 가격 확인을 제공하고, 사용자가 직접 켠 설정에 한해서만 알림과 백그라운드 위치 권한을 요청합니다.

## 실행

레포지토리 루트에서 실행합니다.

```bash
bun run mobile
bun run mobile:ios
bun run mobile:android
```

`mobile` 디렉터리에서 직접 실행할 수도 있습니다.

```bash
bun install
bun run start
bun run ios
bun run android
```

## 환경변수

로컬 환경변수는 루트의 `.env.local`과, 필요한 경우 `mobile/.env.local`에서 읽습니다. 루트 스크립트는 두 파일을 함께 로드하고, Expo 설정은 [app.config.js](app.config.js)에서 공개 환경변수를 앱 extra 값으로 전달합니다.

`.env`, `.env.local` 같은 로컬 설정 파일과 인증 정보는 커밋하지 않습니다.

App Store 제출용 production 빌드에는 다음 공개 환경변수가 필요합니다.

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_PRIVACY_POLICY_URL
EXPO_PUBLIC_SUPPORT_URL
```

## 권한과 알림

- 알림 권한은 설정 화면에서 사용자가 `운동 리마인더`, `프로틴 세일 알림`, `운동 장소 도착 알림`을 직접 ON 할 때만 요청합니다.
- 앱 시작, 운동 종료, 운동 기록 삭제 같은 자동 동기화 경로는 저장된 enabled 값과 현재 권한 상태만 확인하고 OS 권한 프롬프트를 띄우지 않습니다.
- 운동 시작 위치 저장은 foreground 위치 권한만 사용합니다.
- 백그라운드 위치 권한은 설정 화면의 `운동 장소 도착 알림` ON 동작에서만 요청합니다.
- 장소 도착 알림은 2회 이상 운동한 장소 근처 도착을 OS geofence로 감지하며, 알림에는 주소, 좌표, 운동 상세를 담지 않습니다.

## 구조

- `src/app`: Expo Router 라우트
- `src/entities`: 도메인 모델과 데이터 헬퍼
- `src/features`: 사용자 기능 단위 모듈
- `src/shared`: 공용 훅, 라이브러리, i18n, UI
- `src/tokens`: 디자인 토큰
- `docs/page`: 화면과 기능별 동작 문서

주요 기능 위치는 다음과 같습니다.

- `src/features/manage-settings`: 설정 화면, 알림 토글, 주간 루틴 설정
- `src/features/view-summary`: 운동일지 화면과 주간 루틴 진행률
- `src/features/do-workout`: 운동 진행 화면
- `src/features/view-proteins`: 프로틴 목록과 상세 진입
- `src/entities/workout-session`: 운동 세션 저장, 루틴, 리마인더, 장소 도착 알림 로직
- `src/shared/lib/protein-sale-notification`: 프로틴 세일 알림 권한과 예약 로직

## 자주 쓰는 명령어

```bash
bunx tsc --noEmit
bun run lint
bun run web
```

루트에서 실행할 때는 `bun run mobile`, `bun run mobile:ios`, `bun run mobile:android`를 사용합니다.
