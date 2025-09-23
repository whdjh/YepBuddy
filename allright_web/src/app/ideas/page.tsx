import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/ideas/components/CardSection";
import { mockIdeasCards } from "@/mock/ideasCardData";

export default function Ideas() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-20">
      <Hero title="IdeasGPT" subtitle="당신의 운동 루틴을 찾기" />
      <CardSection cards={mockIdeasCards} />
    </div>
  );
}