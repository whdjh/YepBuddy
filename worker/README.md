# YepBuddy Worker

쿠팡 파트너스 상품 가격을 주기적으로 수집해 Supabase에 일별 이력으로 저장하고, 모바일 앱의 가격대 판정과 가격 추이 시각화로 연결하는 워커입니다.

## 전체 아키텍처

![YepBuddy Worker 전체 아키텍처](./docs/assets/worker-architecture.png)

---

## 핵심 구현

### 1. 가격 수집부터 판정과 시각화까지 연결한 프로틴 가격 추적

> 상품별 가격 이력을 자동으로 수집하고, 현재 가격을 과거 분포와 비교해 구매 시점을 판단할 수 있도록 구성했습니다.

#### 문제

프로틴의 현재 가격만 보면 평소보다 저렴한지 판단하기 어려웠습니다. 상품마다 가격대가 다르고 할인 폭도 계속 변하기 때문에, 하나의 고정 기준으로 모든 상품을 비교하는 방식도 적합하지 않았습니다.

#### 가격 이력을 선택한 이유

- 최신 가격만 저장: 현재가는 확인할 수 있지만 과거 대비 가격 수준을 알 수 없음
- 고정 기준 가격과 비교: 구현은 단순하지만 상품별 가격대와 시장 변화를 반영하기 어려움
- 상품별 가격 이력과 비교: 각 상품의 실제 가격 분포를 기준으로 현재 가격의 상대적 수준을 판단 가능

상품별 이력을 원본 데이터로 쌓고, 조회 시점의 통계에 따라 가격대를 판정하는 방식을 선택했습니다.

#### 구현 과정

##### 1. GitHub Actions로 30분마다 가격 수집

```yaml
on:
  schedule:
    - cron: "*/30 * * * *"
  workflow_dispatch:

concurrency:
  group: coupang-tracker
  cancel-in-progress: false
```

- 예약 실행과 수동 실행을 함께 지원
- 같은 가격 추적 작업이 겹치지 않도록 하나의 concurrency group 사용
- 상품별 트래커를 실행해 등록된 프로틴의 가격 수집

##### 2. API 호출을 직렬화하고 상품 검색 범위 제한

```js
const MAX_CALLS_PER_RUN = 50
const MIN_CALL_INTERVAL_MS = 1250
let rateLimitQueue = Promise.resolve()

export function waitForRateLimit() {
  rateLimitQueue = rateLimitQueue.then(async () => {
    const waitMs = Math.max(0, MIN_CALL_INTERVAL_MS - (Date.now() - lastCallAt))
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs))

    if (++callCount > MAX_CALLS_PER_RUN) {
      throw new Error("API_RATE_LIMIT_EXCEEDED")
    }
    lastCallAt = Date.now()
  })

  return rateLimitQueue
}
```

- 검색과 딥링크 변환을 포함한 모든 쿠팡 API 호출을 하나의 Promise 큐로 직렬화
- 분당 50회 제한에 맞춰 호출 사이에 최소 1,250ms 간격 확보
- 한 번 실행할 때 최대 50회까지만 호출해 예상하지 못한 반복 요청 차단
- 상품별 검색 키워드는 최대 2개, 검색 결과는 10개로 제한해 호출량 절약

```js
const matchedProducts = products.filter((product) => product.productId === productId)
```

- 상품명 검색 결과에서 미리 지정한 `productId`가 일치하는 상품만 선택
- 유사한 이름이나 다른 중량의 상품이 가격 이력에 섞이는 문제 방지

##### 3. 상품 조건에 맞춰 가격을 정규화하고 구매 링크 생성

```js
const quantityMatch = product.productName.match(/(\d+)개\s*(세트)?/)
const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1

if (quantity > 1) {
  finalPrice = Math.round(basePrice / quantity)
}
```

- 상품별 트래커에서 중량 조건을 확인하고 여러 개 묶음 상품은 낱개 가격으로 환산
- 선택적으로 할인율을 적용해 최종 저장 가격 계산
- 일반 상품 URL을 쿠팡 파트너스 딥링크로 변환하고, 변환 실패 시 원본 URL 사용

##### 4. 상품과 날짜를 기준으로 가격 이력 저장

```js
const insertData = {
  observed_date: todayStr,
  price: finalPrice,
  available: true,
  protein_id: proteinId,
  url,
}

await supabase
  .from("protein_prices_daily")
  .upsert([insertData], {
    onConflict: "protein_id,observed_date",
    ignoreDuplicates: false,
  })
```

- `protein_id`와 `observed_date` 조합을 기준으로 일별 가격 저장
- 같은 날 워커가 다시 실행되면 행을 추가하지 않고 최신 가격과 URL로 갱신
- 날짜별 행은 유지해 모바일 앱에서 과거 가격 추이 조회 가능

##### 5. 표본 수에 따라 현재 가격대 판정

```ts
if (sampleCount >= 5) {
  if (price <= p20) return { kind: "low", reason: "P20 이하" }
  if (price >= p80) return { kind: "high", reason: "P80 이상" }
  return { kind: "mid", reason: "중간 구간" }
}

if (p50 != null) {
  if (price <= p50 * 0.9) return { kind: "low", reason: "중앙값-10% 이하" }
  if (price >= p50 * 1.1) return { kind: "high", reason: "중앙값+10% 이상" }
  return { kind: "mid", reason: "중앙값±10%" }
}
```

- Supabase RPC에서 최신 가격, 단백질 1g당 가격, `P20·P50·P80`과 표본 수 조회
- 표본이 5개 이상이면 분위수, 부족하면 중앙값 대비 ±10%를 기준으로 저가·중간·고가 판정
- 판정값을 가격 이력에 저장하지 않고 모바일 앱에서 조회할 때 계산해 최신 분포 반영
- 유효한 날짜와 가격만 오래된 순서로 변환해 가격 추이 차트 구성

#### 결과

- 30분 주기의 상품 가격 수집 자동화
- API 호출 간격과 검색 범위를 제한해 호출 한도 내에서 가격과 딥링크 수집
- 같은 날짜의 중복 행 없이 상품별 일별 가격 이력 축적
- 현재가, 단백질 1g당 가격, 가격대 배지와 과거 추이를 함께 제공해 구매 시점 판단 지원
