import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import About from "@/app/users/[username]/components/About";
import WishProtein from "@/app/users/[username]/components/WishProtein";

export default function TabSection({
  username,
  activeTab,
}: {
  username: string;
  activeTab: "abouts" | "wishs";
}) {
  return (
    <div className="m-6">
      <div className="flex gap-2.5" role="tablist" aria-label="트레이너 상세 탭">
        <Button
          asChild
          variant="outline"
          className={cn(
            activeTab === "abouts" && "bg-white/10 text-accent-foreground"
          )}
          aria-current={activeTab === "abouts" ? "page" : undefined}
          role="tab"
        >
          <Link href={`/users/${username}?tab=abouts`}>소개</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className={cn(
            activeTab === "wishs" && "bg-white/10 text-accent-foreground"
          )}
          aria-current={activeTab === "wishs" ? "page" : undefined}
          role="tab"
        >
          <Link href={`/users/${username}?tab=wishs`}>단백질</Link>
        </Button>
      </div>

      <div className="mt-6">
        {activeTab === "abouts" ? <About /> : <WishProtein />}
      </div>
    </div>
  );
}
