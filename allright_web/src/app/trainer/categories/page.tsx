import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/trainer/categories/components/CardSection";
import { mockCategoriesCards } from "@/app/trainer/categories/components/_mock/categoryCardData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "헬스장별 트레이너 | Allright",
  description: "헬스장별 트레이너 페이지 입니다.",
};

export default function Categories() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero
        title="헬스장별 트레이너"
        subtitle="헬스장별 트레이너 목록"
      />
      <CardSection cards={mockCategoriesCards} />
    </div>
  );
}
