"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ProteinPrice } from "@/lib/protein/getProteinByIdPrice";

type Props = { data: ProteinPrice[] };

const config: ChartConfig = {
  price: { label: "가격 원", color: "#16a34a" },
};

// YYYY-MM
function toYM(iso: string) {
  const d = new Date(iso);
  return `${String(d.getFullYear()).slice(2)}-${String(d.getMonth() + 1).padStart(2, "0")}`; // 예: 25-05
}

export default function PriceHistoryChart({ data }: Props) {
  // 1) 원본 날짜 그대로 x축 값으로 사용
  const rows = data.slice().reverse().map((d) => ({
    x: d.observed_date,   // ISO 날짜 그대로
    price: d.price,
  }));

  // 2) X축에 표시할 '틱'은 월별로 한 개씩만 뽑기 (해당 월의 첫 데이터)
  const seen = new Set<string>();
  const monthTicks: string[] = [];
  for (const r of rows) {
    const ym = toYM(r.x);
    if (!seen.has(ym)) {
      seen.add(ym);
      monthTicks.push(r.x); // 실제 X값(ISO)을 틱으로 등록
    }
  }

  return (
    <ChartContainer className="w-full aspect-[16/9] rounded-3xl bg-white/10 p-3" config={config}>
      <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          ticks={monthTicks}                         // 월별 한 개만 라벨
          tickFormatter={(value: string) => toYM(value)} // 라벨을 YY-MM로 표시 (예: 25-05)
          tickMargin={8}
          minTickGap={16}
          interval="preserveStartEnd"
        />
        <YAxis tickFormatter={(v) => v.toLocaleString()} tickMargin={8} width={60} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelKey="x"
              labelFormatter={(value: string) => toYM(value)} // 툴팁 라벨도 YY-MM
              formatter={(value) => (
                <span className="font-mono">{Number(value).toLocaleString()} 원</span>
              )}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="price"
          name="가격"
          stroke="var(--color-price, #22c55e)"
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
