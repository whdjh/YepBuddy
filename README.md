# YepBuddy

YepBuddy는 운동 기록 모바일 앱, 서비스 랜딩페이지, 프로틴 가격 추적 워커를 함께 관리하는 모노레포입니다.

## 프로젝트 구성

- `mobile`: Expo/React Native 기반 YepBuddy 모바일 앱
- `web`: React/Vite 기반 서비스 랜딩페이지
- `worker`: 쿠팡 파트너스 상품 검색과 Supabase 가격 저장을 담당하는 가격 추적 워커

## 사전 준비

- Bun
- pnpm 10
- Node.js
- iOS/Android 개발 환경은 Expo 네이티브 빌드 실행 시 필요합니다.

각 하위 프로젝트의 의존성 설치 방식과 세부 실행 방법은 해당 디렉터리의 README를 함께 확인합니다.

## 실행

레포지토리 루트에서 실행합니다.

```bash
bun run mobile
bun run mobile:ios
bun run mobile:android
bun run web
bun run worker
```

하위 프로젝트 디렉터리에서 직접 실행할 수도 있습니다.

```bash
cd mobile
bun run start

cd ../web
pnpm dev

cd ../worker
node --env-file=../.env.local trackers/all.js
```

## 환경변수

루트의 `.env.local`을 공통 로컬 환경변수 파일로 사용합니다. 필요한 경우 각 하위 프로젝트에도 `.env.local`을 둘 수 있습니다.

모바일 앱은 Supabase 공개 키가 필요합니다.

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_PRIVACY_POLICY_URL
EXPO_PUBLIC_SUPPORT_URL
```

워커는 쿠팡 파트너스와 Supabase 서비스 키가 필요합니다.

```text
COUPANG_ACCESS_KEY
COUPANG_SECRET_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
COUPANG_DISCOUNT_PERCENT
```

`COUPANG_DISCOUNT_PERCENT`는 선택 값입니다. `.env`, `.env.local`, 인증 키, 서비스 키는 커밋하지 않습니다.

## 참고 문서

- [mobile/README.md](mobile/README.md)
- [web/README.md](web/README.md)
- [worker/README.md](worker/README.md)
