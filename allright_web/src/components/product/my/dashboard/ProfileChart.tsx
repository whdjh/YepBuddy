'use client';

import { Line, CartesianGrid, LineChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const chartData = [
  { month: "January", views: 186 },
  { month: "February", views: 305 },
  { month: "March", views: 237 },
  { month: "April", views: 73 },
  { month: "May", views: 209 },
  { month: "June", views: 214 },
];
const chartConfig = {
  views: {
    label: "👁️",
    color: "#16a34a",
  },
};

export default function ProfileChart() {
  return (
    <Card className="w-1/2">
      <CardHeader>
        <CardTitle>방문자 수</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Line
              dataKey="views"
              type="natural"
              stroke="var(--color-views)"
              strokeWidth={2}
              dot={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}