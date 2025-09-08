import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Overview from "@/components/product/trainer/detail/OverViews";
import Reviews from "@/components/product/trainer/detail/Reviews";

export default function TabSection({
  id,
  activeTab,
}: {
  id: string;
  activeTab: "overviews" | "reviews";
}) {
  return (
    <>
      <div className="flex gap-2.5" role="tablist" aria-label="트레이너 상세 탭">
        <Button
          asChild
          variant="outline"
          className={cn(
            activeTab === "overviews" && "bg-white/10 text-accent-foreground"
          )}
          aria-current={activeTab === "overviews" ? "page" : undefined}
          role="tab"
        >
          <Link href={`/trainer/${id}?tab=overviews`}>소개</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className={cn(
            activeTab === "reviews" && "bg-white/10 text-accent-foreground"
          )}
          aria-current={activeTab === "reviews" ? "page" : undefined}
          role="tab"
        >
          <Link href={`/trainer/${id}?tab=reviews`}>리뷰</Link>
        </Button>
      </div>

      <div className="mt-6">
        {activeTab === "overviews" ? <Overview /> : <Reviews />}
      </div>
    </>
  );
}
