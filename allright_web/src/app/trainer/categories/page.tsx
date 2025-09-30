import { Hero } from "@/components/common/Hero";
import CategoryCard from "@/app/trainer/categories/components/CategoryCard";

export default function Categories() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="헬스장별 트레이너" subtitle="헬스장별 트레이너 목록" />
      <div className="grid grid-cols-1 mob:grid-cols-2 tab:grid-cols-3 gap-10">
        {Array.from({ length: 1 }).map((_, index) => (
          <CategoryCard
            key={`${index}`}
            id={`${index}`}
            name="엔오엔짐"
            description="헬스장 위치"
          />
        ))}
      </div>
    </div>
  );
}
