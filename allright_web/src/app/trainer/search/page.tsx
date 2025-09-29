import { Hero } from "@/components/common/Hero";
import SearchSection from "@/app/trainer/search/components/SearchSection";
import CardSection from "@/app/trainer/components/CardSection";
import { mockTrainerCards } from "@/mock/trainerCardData";

type PageProps = {
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
      <Hero title="트레이너 검색" subtitle="이름으로 트레이너 검색" />
      <SearchSection />
      <CardSection cards={filtered} />
    </div>
  );
}
