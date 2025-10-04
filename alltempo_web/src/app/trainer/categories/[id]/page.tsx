import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/trainer/components/CardSection";
import { mockTrainerCards } from "@/app/trainer/components/_mock/trainerCardData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "헬스장별 트레이너 상세 | Allright",
  description: "헬스장별 트레이너 페이지 입니다.",
};


export default function CategoriesId() {
  // MEMO: 카테고리별 ID([id])값을 가져와서 해당 ID에 해당하는 카드만 보여주기
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="헬스장 명" subtitle="헬스장 위치" />
      <CardSection cards={mockTrainerCards} />
    </div>
  );
}
