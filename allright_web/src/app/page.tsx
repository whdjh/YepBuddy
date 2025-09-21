import Link from "next/link";
import IdeaCard from "@/components/common/Card/IdeaCard";
import PartnerCard from "@/components/common/Card/PartnerCard";
import TeamCard from "@/components/common/Card/TeamCard";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/product/main/HeroSection";
import SlideSection from "@/components/product/main/SlideSection";
import TrainerSection from "@/components/product/main/TrainerSection";
import CommunitySection from "@/components/product/main/CommunitySection";
import IdeasSection from "@/components/product/main/IdeasSection";

export default function Home() {
  return (
    <div className="pt-5 px-20 space-y-20">
      <HeroSection />
      <SlideSection />
      <TrainerSection />
      <IdeasSection />
      <CommunitySection />
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
