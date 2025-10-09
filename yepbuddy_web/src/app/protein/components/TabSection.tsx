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
    <div
      className="grid grid-cols-2 gap-2.5 tab:flex tab:flex-nowrap overflow-x-hidden w-full"
      role="tablist"
      aria-label="프로틴 카테고리 탭"
    >
      <Button
        asChild
        variant="outline"
        className={cn(
          "w-full tab:w-auto",
          activeTab === "wpc" && "bg-white/10 text-accent-foreground"
        )}
        aria-current={activeTab === "wpc" ? "page" : undefined}
        role="tab"
      >
        <Link href={makeHref({ tab: "wpc" })}>WPC</Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className={cn(
          "w-full tab:w-auto",
          activeTab === "wpi" && "bg-white/10 text-accent-foreground"
        )}
        aria-current={activeTab === "wpi" ? "page" : undefined}
        role="tab"
      >
        <Link href={makeHref({ tab: "wpi" })}>WPI</Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className={cn(
          "w-full tab:w-auto",
          activeTab === "wpcwpi" && "bg-white/10 text-accent-foreground"
        )}
        aria-current={activeTab === "wpcwpi" ? "page" : undefined}
        role="tab"
      >
        <Link href={makeHref({ tab: "wpcwpi" })}>WPC+WPI</Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className={cn(
          "w-full tab:w-auto",
          activeTab === "creatine" && "bg-white/10 text-accent-foreground"
        )}
        aria-current={activeTab === "creatine" ? "page" : undefined}
        role="tab"
      >
        <Link href={makeHref({ tab: "creatine" })}>크레아틴</Link>
      </Button>

      <Button
        asChild
        variant="outline"
        className={cn(
          "w-full tab:w-auto",
          activeTab === "beta-alanine" && "bg-white/10 text-accent-foreground"
        )}
        aria-current={activeTab === "beta-alanine" ? "page" : undefined}
        role="tab"
      >
        <Link href={makeHref({ tab: "beta-alanine" })}>베타알라닌</Link>
      </Button>
    </div>
  );
}
