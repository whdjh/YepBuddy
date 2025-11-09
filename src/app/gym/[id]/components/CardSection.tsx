"use client";

import { useGymMachines } from "@/hooks/queries/gyms/useGymMachines";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORY_LABEL: Record<string, string> = {
  back: "등",
  chest: "가슴",
  arm: "팔",
  shoulder: "어깨",
  leg: "하체",
  free: "프리웨이트",
  cardio: "유산소",
  etc: "기타",
};

interface Props {
  gymId: number;
}

export default function CardSection({ gymId }: Props) {
  const { data, isLoading, error } = useGymMachines(gymId);

  const grouped = (data ?? []).reduce<
    Record<string, { name: string; brand?: string | null; notes?: string | null; quantity: number }[]>
  >((acc, m) => {
    const key = m.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push({
      name: m.name,
      brand: m.brand,
      notes: m.notes,
      quantity: m.quantity,
    });
    return acc;
  }, {});

  const categories = ["back", "chest", "arm", "shoulder", "leg", "free", "cardio", "etc"];

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">로딩 중</div>;
  }
  if (error) {
    return <div className="text-sm text-red-400">기구 목록을 불러오는 중 오류가 발생했습니다</div>;
  }

  return (
    <div className="col-span-full tab:col-span-4">
      <div className="grid grid-cols-2 tab:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const items = grouped[cat] ?? [];
          return (
            <Card className="bg-transparent" key={cat}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {CATEGORY_LABEL[cat]}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 font-medium text-sm tab:text-lg">
                {items.length === 0 ? (
                  <div className="px-6 pb-6 text-sm text-muted-foreground">등록된 기구가 없습니다.</div>
                ) : (
                  <ul className="text-sm tab:text-lg list-disc list-inside px-6 pb-6 space-y-1">
                    {items.map((v, i) => (
                      <li key={`${cat}-${i}`}>
                        {v.name}
                        {v.brand ? ` (${v.brand})` : ""}
                        {v.quantity > 1 ? ` x${v.quantity}` : ""}
                        {v.notes ? ` - ${v.notes}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
