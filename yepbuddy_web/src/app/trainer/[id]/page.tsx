import HeaderSection from "@/app/trainer/[id]/components/HeaderSection";
import TabSection from "@/app/trainer/[id]/components/TabSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "트레이너 상세 | 옙버디",
  description: "트레이너 상세 페이지 입니다.",
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function TrainerId({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab: "overviews" | "reviews" = tab === "reviews" ? "reviews" : "overviews";

  return (
    <div className="space-y-10 p-2 tab:p-5">
      <HeaderSection
        title="트레이너 이름"
        location="헬스장 위치"
        rating={5}
        reviewCount={100}
        voteCount={100}
      />
      <TabSection
        id={id}
        activeTab={activeTab}
      />
    </div>
  );
}