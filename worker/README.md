# YepBuddy Worker

YepBuddy의 쿠팡 가격 추적 워커입니다.

키워드로 쿠팡 파트너스 상품을 검색하고, 대상 프로틴과 매칭한 뒤, 상품 URL을 딥링크로 변환해서 일별 가격을 Supabase에 저장합니다.

## 실행

레포지토리 루트에서 실행합니다.

```bash
bun run worker
```

`worker` 디렉터리에서 직접 실행할 수도 있습니다.

```bash
npm install
node --env-file=../.env.local trackers/all.js
```

## 환경변수

필수 값입니다.

```text
COUPANG_ACCESS_KEY
COUPANG_SECRET_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

선택 값입니다.

```text
COUPANG_DISCOUNT_PERCENT
```

로컬에서는 env 파일에, GitHub Actions에서는 Secrets에 저장합니다. 인증 정보는 커밋하지 않습니다.

## 구조

- `trackers/`: 상품별 추적 스크립트
- `trackers/all.js`: 전체 추적기 실행 진입점
- `lib/coupangApi.js`: 쿠팡 검색/딥링크 API 클라이언트와 호출 제한 처리
- `lib/coupangTracker.js`: 상품 매칭, 할인 계산, Supabase 저장 헬퍼
- `utils/hmacGenerator.js`: 쿠팡 HMAC 인증 헤더 생성

## 참고

- 상품 검색 시도 횟수는 API 호출량을 아끼기 위해 제한합니다.
- API 호출은 최소 1250ms 간격으로 실행합니다.
- GitHub Actions에서는 `.github/workflows/crawl-coupang.yml`이 이 워커를 실행합니다.
