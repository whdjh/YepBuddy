import { Hero } from "@/components/common/Hero";
import SearchSection from "@/components/product/trainer/search/SearchSection";
import CardSection from "@/components/product/trainer/CardSection";
import { mockProductCards } from "@/mock/productCardData";

type PageProps = {
  searchParams: Promise<{ query?: string }>;
};

export default async function Search({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = (sp.query ?? "").trim().toLowerCase();

  const filtered = q
    ? mockProductCards.filter((c) => c.name.toLowerCase().includes(q))
    : mockProductCards;

  return (
    <div className="space-y-20 p-5">
      <Hero title="검색" subtitle="트레이너의 이름을 검색하세요!" />
      <SearchSection />
      <CardSection cards={filtered} />
    </div>
  );
}
