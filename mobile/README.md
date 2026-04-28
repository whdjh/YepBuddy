# YepBuddy Mobile

YepBuddy의 Expo/React Native 모바일 앱입니다.

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
```

## 환경변수

로컬 환경변수는 루트의 `.env.local`과, 필요한 경우 `mobile/.env.local`에서 읽습니다.

`.env`, `.env.local` 같은 로컬 설정 파일과 인증 정보는 커밋하지 않습니다.

## 구조

- `src/app`: Expo Router 라우트
- `src/entities`: 도메인 모델과 데이터 헬퍼
- `src/features`: 사용자 기능 단위 모듈
- `src/shared`: 공용 훅, 라이브러리, i18n, UI
- `src/tokens`: 디자인 토큰

## 자주 쓰는 명령어

```bash
bun run lint
bun run web
```
