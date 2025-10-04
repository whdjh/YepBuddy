import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TabSection({
  activeTab,
  makeHref,
}: {
  activeTab: "wpc" | "wpi" | "wpcwpi" | "creatine" | "beta-alanine";
  makeHref: (updates: Record<string, string | null>) => string;
}) {
  return (
      <div className="flex gap-2.5" role="tablist" aria-label="프로틴 카테고리 탭">
        {/* 변경: 각 탭의 className/aria-current 조건과 링크를 정확히 해당 탭으로 수정 */}
        <Button
          asChild
          variant="outline"
          className={cn(activeTab === "wpc" && "bg-white/10 text-accent-foreground")}
          aria-current={activeTab === "wpc" ? "page" : undefined}
          role="tab"
        >
          <Link href={makeHref({ tab: "wpc" })}>WPC</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className={cn(activeTab === "wpi" && "bg-white/10 text-accent-foreground")}
          aria-current={activeTab === "wpi" ? "page" : undefined}
          role="tab"
        >
          <Link href={makeHref({ tab: "wpi" })}>WPI</Link>
        </Button>

        {/* 변경: "wpc+wpi"는 '+' 포함. makeHref가 URLSearchParams를 사용하므로 자동 인코딩됨 */}
        <Button
          asChild
          variant="outline"
          className={cn(activeTab === "wpcwpi" && "bg-white/10 text-accent-foreground")}
          aria-current={activeTab === "wpcwpi" ? "page" : undefined}
          role="tab"
        >
          <Link href={makeHref({ tab: "wpcwpi" })}>WPC+WPI</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className={cn(activeTab === "creatine" && "bg-white/10 text-accent-foreground")}
          aria-current={activeTab === "creatine" ? "page" : undefined}
          role="tab"
        >
          <Link href={makeHref({ tab: "creatine" })}>크레아틴</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className={cn(activeTab === "beta-alanine" && "bg-white/10 text-accent-foreground")}
          aria-current={activeTab === "beta-alanine" ? "page" : undefined}
          role="tab"
        >
          <Link href={makeHref({ tab: "beta-alanine" })}>베타알라닌</Link>
        </Button>
      </div>
  );
}
