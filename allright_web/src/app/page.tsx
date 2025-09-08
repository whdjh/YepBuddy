import Link from "next/link";
import ProductCard from "@/components/common/Card/ProductCard";
import PostCard from "@/components/common/Card/PostCard";
import IdeaCard from "@/components/common/Card/IdeaCard";
import PartnerCard from "@/components/common/Card/PartnerCard";
import TeamCard from "@/components/common/Card/TeamCard";
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
            <Link href="/trainer/leaderboards">트레이너 전체 보기 &rarr;</Link>
          </Button>
        </div>
        {Array.from({ length: 11 }).map((_, index) => (
          <ProductCard
            key={`${index}`}
            id={`${index}`}
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
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            IdeasGPT
          </h2>
          <p className="text-xl font-light text-foreground">
            나만의 운동 루틴을 상품으로 판매하세요. GPT가 만든 루틴도, 직접 만든 루틴도 손쉽게 등록할 수 있어요.
          </p>
          <Button variant="link" asChild className="text-lg p-0">
            <Link href="/ideas">운동루틴 전체 보기 &rarr;</Link>
          </Button>
        </div>
        {Array.from({ length: 11 }).map((_, index) => (
          <IdeaCard
            key={`ideaId-${index}`}
            id={`ideaId-${index}`}
            title="A startup that creates an AI-powered generated personal trainer, delivering customized fitness recommendations and tracking of progress using a mobile app to track workouts and progress as well as a website to manage the business."
            viewsCount={123}
            postedAt="12 hours ago"
            likesCount={12}
            claimed={index % 2 === 0}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            파트너 최신글
          </h2>
          <p className="text-xl font-light text-foreground">
            운동 파트너를 구해보세요!
          </p>
          <Button variant="link" asChild className="text-lg p-0">
            <Link href="/ideas">파트너 전체 보기 &rarr;</Link>
          </Button>
        </div>
        {Array.from({ length: 11 }).map((_, index) => (
          <PartnerCard
            key={`jobId-${index}`}
            id={`jobId-${index}`}
            gym="NONGYM"
            gymLogoUrl="https://github.com/facebook.png"
            gymHq="경기도, 용인시"
            title="하체운동"
            postedAt="12 hours ago"
            type="everyday"
            positionLocation="Remote"
            time="12:00 - 14:00"
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            PT 회원 모집
          </h2>
          <p className="text-xl font-light text-foreground">
            1:1 맞춤 트레이닝 회원을 모집·관리하는 공간
          </p>
          <Button variant="link" asChild className="text-lg p-0">
            <Link href="/teams">전체 팀 보기 &rarr;</Link>
          </Button>
        </div>

        {Array.from({ length: 11 }).map((_, index) => (
          <TeamCard
            key={`teamId-${index}`}
            id={`teamId-${index}`}
            leaderUsername="이주훈"
            leaderAvatarUrl="https://github.com/gym.png"
            positions={["초보 환영", "재활·통증 케어", "다이어트"]}
            teamDescription="맞춤형 8주 트레이닝"
          />
        ))}
      </div>
    </div >
  );
}
