import { Hero } from "@/components/common/Hero";
import CardSection from "@/components/product/ideas/CardSection";
import { mockIdeasCards } from "@/mock/ideasCardData";

export default function Ideas() {
  return (
    <div className="space-y-20">
      <Hero title="IdeasRoutine" subtitle="당신의 운동 루틴을 찾아보세요!" />
      <CardSection cards={mockIdeasCards} />
    </div>
  );
}