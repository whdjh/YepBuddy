import { Hero } from "@/components/common/Hero";
import CategoryCard from "@/app/trainer/categories/components/CategoryCard";

export default function Categories() {
  // MEMO: 카테고리별 ID([id])값을 가져와서 해당 ID에 해당하는 카드만 보여주기
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="카테고리별 트레이너" subtitle="카테고리별 트레이너 목록" />
      <div className="grid grid-cols-1 tab:grid-cols-2 pc:grid-cols-3 gap-10">
        {Array.from({ length: 10 }).map((_, index) => (
          <CategoryCard
            key={`${index}`}
            id={`${index}`}
            name="Category Name"
            description="Category Description"
          />
        ))}
      </div>
    </div>
  );
}
