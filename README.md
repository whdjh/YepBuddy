# YepBuddy

YepBuddy는 운동 기록 모바일 앱, 서비스 랜딩페이지, 프로틴 가격 추적 워커를 함께 관리하는 모노레포입니다.

이 저장소는 단일 앱 제품이면서 동시에 Expo/React Native 기반 피트니스 앱을 만드는 개발자가 참고할 수 있는 공개 구현 사례를 목표로 합니다. 운동 세션 상태 관리, HealthKit 연동, 위치 기반 운동 리마인더, 라이브 액티비티, 가격 추적 워커처럼 모바일 앱에서 반복적으로 부딪히는 기능을 실제 서비스 코드 형태로 확인할 수 있습니다.

## 오픈소스 활용 가치

- Expo/React Native 앱에서 운동 기록, 루틴 진행, 알림, 위치 권한을 함께 다루는 구조를 참고할 수 있습니다.
- iOS HealthKit, 라이브 액티비티, 다이내믹 아일랜드 연동을 앱 기능과 연결한 예제를 제공합니다.
- Supabase를 사용하는 모바일 앱과 백그라운드 워커의 환경변수, 데이터 접근, 배포 구성을 함께 살펴볼 수 있습니다.
- 기능 문서, PR 단위 변경, 릴리스 자동화 워크플로를 통해 작은 앱을 지속적으로 유지관리하는 방식을 공유합니다.

## 운영 현황

이 프로젝트는 공개 리포지터리에서 기능 개발, 버그 수정, 문서 갱신을 PR 단위로 관리합니다. 현재는 핵심 메인테이너 중심으로 운영하며, 앱 안정화와 재사용 가능한 구현 정리를 우선순위로 두고 있습니다.

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

## License

Code is licensed under the [MIT License](LICENSE). Product names, branding,
and private deployment configuration are not included in the license grant.
