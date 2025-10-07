import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/trainer/components/CardSection";
import { mockTrainerCards } from "@/app/trainer/components/_mock/trainerCardData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인기트레이너 | 옙버디",
  description: "인기 트레이너 페이지 입니다.",
};

export default function Trainer() {
  return (
    <div className="space-y-20 tab:p-5 p-2">
      <Hero
        title="인기 트레이너"
        subtitle="가장 인기 있는 트레이너"
      />
      <CardSection cards={mockTrainerCards} />
    </div>
  );
}