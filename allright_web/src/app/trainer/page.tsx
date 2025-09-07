import { Hero } from "@/components/common/hero";
import CardSection from "@/components/product/trainer/CardSection";
import { mockProductCards } from "@/mock/cardData";

export default function Trainer() {
  return (
    <div className="space-y-20">
      <Hero
        title="트레이너"
        subtitle="가장 인기 있는 트레이너"
      />
      <CardSection cards={mockProductCards} />
    </div>
  );
}
