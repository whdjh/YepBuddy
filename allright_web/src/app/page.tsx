import Link from "next/link";
import TeamCard from "@/components/common/Card/TeamCard";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/product/main/HeroSection";
import SlideSection from "@/components/product/main/SlideSection";
import TrainerSection from "@/components/product/main/TrainerSection";
import IdeasSection from "@/components/product/main/IdeasSection";
import CommunitySection from "@/components/product/main/CommunitySection";
import PartnerSection from "@/components/product/main/PartnerSection";

export default function Home() {
  return (
    <div className="pt-5 px-20 space-y-20">
      <HeroSection />
      <SlideSection />
      <TrainerSection />
      <IdeasSection />
      <CommunitySection />
      <PartnerSection />
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
