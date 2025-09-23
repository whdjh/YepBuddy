import { Hero } from "@/components/common/Hero";
import MainSection from "@/app/ideas/[id]/components/MainSection";

export default async function IdeaCardId() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-10">
      <Hero title="Idea title명 가져오기" />
      <MainSection />
    </div>
  );
}