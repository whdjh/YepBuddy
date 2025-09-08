import HeaderSection from "@/components/product/trainer/detail/HeaderSection";
import TabSection from "@/components/product/trainer/detail/TabSection";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function TrainerId({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab: "overviews" | "reviews" = tab === "overviews" ? "overviews" : "reviews";

  return (
    <div className="space-y-10">
      <HeaderSection
        title="트레이너 이름"
        description="트레이너 설명"
        rating={5}
        reviewCount={100}
        voteCount={100}
      />
      <TabSection id={id} activeTab={activeTab} />
    </div>
  );
}