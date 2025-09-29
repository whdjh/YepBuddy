import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/gym/components/CardSection";
import { mockGymsCards } from "@/mock/gymCardData";

export default function Gym() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-20">
      <Hero title="헬스장" subtitle="내부 머신을 쉽게 찾아보세요" />
      <CardSection cards={mockGymsCards} />
    </div>
  );
}