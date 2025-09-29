import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/trainer/components/CardSection";
import { mockProductCards } from "@/mock/trainerCardData";

export default function CategoriesId() {
  // MEMO: 카테고리별 ID([id])값을 가져와서 해당 ID에 해당하는 카드만 보여주기
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="헬스장 명" subtitle="헬스장 위치" />
      <CardSection cards={mockProductCards} />
    </div>
  );
}
