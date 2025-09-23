import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/trainer/components/CardSection";
import { mockProductCards } from "@/mock/productCardData";

export default function Trainer() {
  return (
    <div className="space-y-20 tab:p-5 p-2">
      <Hero title="인기 트레이너" subtitle="가장 인기 있는 트레이너" />
      <CardSection cards={mockProductCards} />
    </div>
  );
}