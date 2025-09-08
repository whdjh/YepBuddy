import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
            "active:bg-accent active:text-accent-foreground transition-colors",
            activeTab === "overviews" && "bg-accent text-accent-foreground"
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
            "active:bg-accent active:text-accent-foreground transition-colors",
            activeTab === "reviews" && "bg-accent text-accent-foreground"
          )}
          aria-current={activeTab === "reviews" ? "page" : undefined}
          role="tab"
        >
          <Link href={`/trainer/${id}?tab=reviews`}>리뷰</Link>
        </Button>
      </div>

      <div className="mt-6">
        {activeTab === "overviews" ? <div>소개 콘텐츠</div> : <div>리뷰 콘텐츠</div>}
      </div>
    </>
  );
}
