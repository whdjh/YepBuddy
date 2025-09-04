import Link from "next/link";
import ProductCard from "@/components/common/Card/ProductCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="px-20 space-y-40">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            오늘의 트레이너
          </h2>
          <p className="text-xl font-light text-foreground">
            오늘의 베스트 트레이너!
          </p>
          <Button variant="link" asChild className="text-lg px-0">
            <Link href="/products/leaderboards">Explore all products &rarr;</Link>
          </Button>
        </div>
        {Array.from({ length: 10 }).map((_, index) => (
          <ProductCard
            key={`trainer-${index}`}
            id={`trainerId-${index}`}
            name="트레이너 이름"
            description="트레이너 소개"
            commentsCount={12}
            viewsCount={12}
            votesCount={120}
          />
        ))}
      </div>
    </div >
  );
}
