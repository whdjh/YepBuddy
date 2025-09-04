import Link from "next/link";
import ProductCard from "@/components/common/Card/ProductCard";
import { PostCard } from "@/components/common/Card/PostCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="pt-5 px-20 space-y-40">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            인기 트레이너
          </h2>
          <p className="text-xl font-light text-foreground">
            오늘 가장 주목받는 트레이너를 만나보세요!
          </p>
          <Button variant="link" asChild className="text-lg px-0">
            <Link href="/products/leaderboards">트레이너 전체 보기 &rarr;</Link>
          </Button>
        </div>
        {Array.from({ length: 11 }).map((_, index) => (
          <ProductCard
            key={`trainer-${index}`}
            id={`trainerId-${index}`}
            name="이주훈"
            description="개발자입니다."
            commentsCount={12}
            viewsCount={12}
            votesCount={120}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            커뮤니티 최신 글
          </h2>
          <p className="text-xl font-light text-foreground">
            방금 올라온 이야기들을 확인해보세요!
          </p>
          <Button variant="link" asChild className="text-lg p-0">
            <Link href="/community">커뮤니티 전체 보기 &rarr;</Link>
          </Button>
        </div>
        {Array.from({ length: 11 }).map((_, index) => (
          <PostCard
            key={`post-${index}`}
            id={`postId-${index}`}
            title="오늘 등했는데 어때?"
            author="이주훈"
            authorAvatarUrl="https://github.com/gym.png"
            category="Productivity"
            postedAt="12 hours ago"
          />
        ))}
      </div>
    </div >
  );
}
