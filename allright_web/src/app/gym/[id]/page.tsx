import { Hero } from "@/components/common/Hero";
import MainSection from "@/app/gym/[id]/components/MainSection";

export default async function IdeaCardId() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-10">
      <Hero title="엔오엔짐" subtitle="헤머스트렝스, 아스날, 짐레코, 다이나믹 피트니스, 매트릭스, 드렉스 머신 보유"/>
      <MainSection />
    </div>
  );
}