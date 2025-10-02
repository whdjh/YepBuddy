import { Hero } from "@/components/common/Hero";
import MainSection from "@/app/gym/[id]/components/MainSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allright | 헬스장 상세",
  description: "해당 헬스장 내부기구를 확인할 수 있는 페이지 입니다.",
};

export default async function GymId() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-10">
      <Hero title="엔오엔짐" subtitle="경기 용인시 기흥구 언남동 201-1"/>
      <MainSection />
    </div>
  );
}