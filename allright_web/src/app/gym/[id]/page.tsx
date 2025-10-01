import { Hero } from "@/components/common/Hero";
import MainSection from "@/app/gym/[id]/components/MainSection";

export default async function GymId() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-10">
      <Hero title="엔오엔짐" subtitle="경기 용인시 기흥구 언남동 201-1"/>
      <MainSection />
    </div>
  );
}