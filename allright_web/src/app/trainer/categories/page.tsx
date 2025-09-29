import { Hero } from "@/components/common/Hero";
import CategoryCard from "@/app/trainer/categories/components/CategoryCard";

export default function Categories() {
  // MEMO: 카테고리별 ID([id])값을 가져와서 해당 ID에 해당하는 카드만 보여주기
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="헬스장별 트레이너" subtitle="헬스장별 트레이너 목록" />
      <div className="grid grid-cols-1 tab:grid-cols-2 pc:grid-cols-3 gap-10">
        {Array.from({ length: 1 }).map((_, index) => (
          <CategoryCard
            key={`${index}`}
            id={`${index}`}
            name="엔오엔짐"
            description="아스날, 짐레코, 헤머스트렝스, 드랙스, 매트릭스 머신 보유"
          />
        ))}
      </div>
    </div>
  );
}
