import { Hero } from "@/components/common/Hero";
import MainSection from "@/app/gym/[id]/components/MainSection";

export default async function IdeaCardId() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-10">
      <Hero title="헬스장명" />
      <MainSection />
    </div>
  );
}