import { Hero } from "@/components/common/Hero";
import SearchSection from "@/app/trainer/search/components/SearchSection";
import CardSection from "@/app/trainer/components/CardSection";
import { mockTrainerCards } from "@/app/trainer/components/_mock/trainerCardData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "트레이너 검색 | 옙버디",
  description: "이름으로 트레이너 검색하는 페이지 입니다.",
};

interface PageProps {
  searchParams: Promise<{ query?: string }>;
};

export default async function Search({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = (sp.query ?? "").trim().toLowerCase();

  const filtered = q
    ? mockTrainerCards.filter((c) => c.name.toLowerCase().includes(q))
    : mockTrainerCards;

  return (
    <div className="space-y-5 tab:space-y-20 p-2 tab:p-5">
      <Hero
        title="트레이너 검색"
        subtitle="이름으로 트레이너 검색"
      />
      <SearchSection />
      <CardSection cards={filtered} />
    </div>
  );
}
