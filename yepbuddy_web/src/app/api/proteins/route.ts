import { NextRequest, NextResponse } from "next/server";
import db from "@/app/db";
import { proteins } from "@/app/protein/schema";
import { and, desc, eq, ilike } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * 단백질 목록 조회 API
 * - HTTP: GET /api/proteins
 * - 기능: 전체 목록 반환. 선택적으로 q, topic 필터 적용.
 * 
 * 쿼리 파라미터
 * - q: 문자열. 제목 부분 검색. ilike로 대소문자 무시 부분 일치.
 * - topic: 문자열. protein_topic enum 중 하나 wpc, wpi, wpcwpi, creatine, beta-alanine
 *
 * 응답 형태
 * - 200: { ok: true, data: { items: Protein[] } }
 * - 500: { ok: false, error: "Internal server error" }
 *
 * 주의 사항
 * - 사용자가 넘긴 topic 값에 대한 엄격 검증을 원하면 화이트리스트 비교를 추가할 수 있음.
 * - Drizzle 체이닝 시 조건부 where를 사용하면 타입이 달라질 수 있어 $dynamic()로 타입 안정성을 확보.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. 쿼리 파라미터 파싱
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const topic = searchParams.get("topic");

    // 2. 조건 구성
    // and()에 undefined를 전달하면 해당 조건은 무시된
    // q가 있으면 제목 부분 검색, topic이 있으면 토픽 일치 필터.
    const where = and(
      q ? ilike(proteins.title, `%${q}%`) : undefined,
      topic ? eq(proteins.topic, topic as any) : undefined,
    );

    // 3. 쿼리 빌드
    // $dynamic()을 통해 빌더 타입을 유연하게 만들어 재할당 시 타입 불일치 경고를 방지한다.
    let qb = db.select().from(proteins).$dynamic();
    if (where) qb = qb.where(where);

    // 4. 정렬
    // 생성 시각 최신순으로 내림차순 정렬하여 최신 항목이 앞에 오도록 한다.
    const rows = await qb.orderBy(desc(proteins.created_at));

    // 5. 응답
    // 데이터는 items 배열로 감싸서 반환한다. 추후 메타데이터를 확장하기 쉽도록 한 계층을 둔다.
    return NextResponse.json({ ok: true, data: { items: rows } });
  } catch (e) {
    // 6. 에러 처리
    // 내부 오류는 상세 스택을 서버 로그로 남기고, 클라이언트에는 일반화된 메시지를 제공한다.
    console.error(e);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
