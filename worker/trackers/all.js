// 모든 쿠팡 상품 추적기 실행
import 'dotenv/config';

// 환경변수 확인
if (!process.env.COUPANG_ACCESS_KEY || !process.env.COUPANG_SECRET_KEY) {
  console.error('❌ 필수 환경 변수가 없습니다: COUPANG_ACCESS_KEY 또는 COUPANG_SECRET_KEY');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 필수 환경 변수가 없습니다: SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 동적 import로 각 트래커 실행
const trackers = [
  './synta6-456kg.js',
  './synta6-isolate.js',
  './evolution-whey.js',
  './evolution-isolate.js',
  './bpi-isolate.js',
  './musclepharm-combat.js',
  './optimum-gold-standard.js',
  './optimum-platinum-hydro.js',
  './now-isolate-456kg.js',
  './allmax-creatine.js',
];

async function runAllTrackers() {
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < trackers.length; i++) {
    const trackerName = trackers[i].replace('./', '').replace('.js', '');
    try {
      console.log(`\n📦 ${trackerName} 추적 시작...`);
      await import(trackers[i]);
      successCount++;
      console.log(`✅ ${trackerName} 완료`);
    } catch (err) {
      failCount++;
      console.error(`❌ ${trackerName} 실패:`, err.message);
    }

    if (i < trackers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n📊 완료: 성공 ${successCount}개, 실패 ${failCount}개`);
}

runAllTrackers().catch(err => {
  console.error('❌ 전체 추적기 실행 실패:', err.message);
  process.exit(1);
});

