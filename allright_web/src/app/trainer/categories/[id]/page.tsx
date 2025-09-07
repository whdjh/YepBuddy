import { Hero } from "@/components/common/hero";
import CardSection from "@/components/product/trainer/CardSection";
import { mockProductCards } from "@/mock/cardData";

export default function CategoriesId() {
  // MEMO: 카테고리별 ID([id])값을 가져와서 해당 ID에 해당하는 카드만 보여주기
  return (
    <div className="space-y-20">
      <Hero title={"카테고리명"} subtitle={"카테고리 설명"} />
      <CardSection cards={mockProductCards} />
    </div>
  );
}
