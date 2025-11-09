import { NextResponse } from "next/server";
import db from "@/app/db";
import { proteinPricesDaily } from "@/app/protein/schema";
import { sql } from "drizzle-orm";

export type PriceStatsRow = {
  protein_id: number;
  p20: number | null;
  p50: number | null;
  p80: number | null;
  min: number | null;
  max: number | null;
  sample_count: number;
};

// Postgres 퍼센타일: percentile_cont
export async function GET() {
  // 최근 180일만
  const rows = await db.execute(sql`
    WITH win AS (
      SELECT
        ${proteinPricesDaily.protein_id}::bigint AS protein_id,
        ${proteinPricesDaily.price}::numeric AS price
      FROM ${proteinPricesDaily}
      WHERE ${proteinPricesDaily.observed_date} >= (CURRENT_DATE - INTERVAL '180 days')
    )
    SELECT
      protein_id,
      CASE WHEN COUNT(*) >= 5
        THEN percentile_cont(0.2) WITHIN GROUP (ORDER BY price)::numeric
        ELSE NULL
      END AS p20,
      CASE WHEN COUNT(*) >= 3
        THEN percentile_cont(0.5) WITHIN GROUP (ORDER BY price)::numeric
        ELSE NULL
      END AS p50,
      CASE WHEN COUNT(*) >= 5
        THEN percentile_cont(0.8) WITHIN GROUP (ORDER BY price)::numeric
        ELSE NULL
      END AS p80,
      MIN(price)::numeric AS min,
      MAX(price)::numeric AS max,
      COUNT(*)::int AS sample_count
    FROM win
    GROUP BY protein_id
  `);

  return NextResponse.json({ ok: true, data: rows });
}
