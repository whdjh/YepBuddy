"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ProteinPrice } from "@/lib/proteins/getProteinByIdPrice";

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
  // 세일가 반영: price * (1 - sale / 100)
  // sale이 1이면 할인 무시 (마이프로틴 제품만 sale 사용, 나머지는 1로 설정되어 있음)
  const rows = data
    .slice()
    .reverse()
    .map((d) => {
      const price = Number(d.price);
      const sale = Number(d.sale);
      return {
        x: d.observed_date,
        price: sale === 1 ? price : Math.round(price * (1 - sale / 100)),
      };
    });

  // 월별로 하나씩만 x축 라벨 표시
  const seen = new Set<string>();
  const monthTicks: string[] = [];
  for (const r of rows) {
    const ym = toYM(r.x);
    if (!seen.has(ym)) {
      seen.add(ym);
      monthTicks.push(r.x);
    }
  }

  return (
    <ChartContainer className="w-full aspect-[16/9] rounded-3xl bg-white/10 p-3" config={config}>
      <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          ticks={monthTicks}
          tickFormatter={(value: string) => toYM(value)}
          tickMargin={8}
          minTickGap={16}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={(v) => v.toLocaleString()}
          tickMargin={8}
          width={60}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelKey="x"
              labelFormatter={(value: string) => toYM(value)}
              formatter={(value) => (
                <span className="font-mono">{Number(value).toLocaleString()} 원</span>
              )}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="price"
          name="세일가"
          stroke="var(--color-price, #22c55e)"
          dot={false}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
