import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/gym/components/CardSection";
import { mockGymsCards } from "@/app/gym/components/_mock/gymCardData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Allright | 헬스장",
  description: "헬스장 목록 페이지 입니다.",
};

export default function Gym() {
  return (
    <div className="p-2 tab:p-5 space-y-5 tab:space-y-20">
      <Hero title="헬스장" subtitle="내부 머신을 쉽게 찾아보세요" />
      <CardSection cards={mockGymsCards} />
    </div>
  );
}