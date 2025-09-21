import Link from "next/link";
import TeamCard from "@/components/common/Card/TeamCard";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { Ripple } from "@/components/ui/ripple";
import { MagicCard } from "@/components/ui/magic-card";

export default function TeamSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="md:-mt-44 overflow-hidden ">
        <div className="flex h-[75vh] relative flex-col justify-center items-center text-center md:text-left">
          <h2 className="md:text-5xl text-3xl font-bold leading-tight tracking-tight ">
            PT 회원 모집
          </h2>
          <p className="max-w-2xl md:text-xl font-light text-foreground">
            1:1 맞춤 트레이닝 회원을 모집·관리하는 공간
          </p>
          <Button variant="link" asChild className="text-lg p-0">
            <Link href="/teams">전체 팀 보기 &rarr;</Link>
          </Button>
          <Ripple />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 -mt-32 md:-mt-60 z-10 gap-4">
          {Array.from({ length: 11 }).map((_, index) => (
            <BlurFade
              delay={0.1 * index}
              duration={0.25}
              inView
              key={index}
              className="w-full"
            >
              <MagicCard className="p-0 h-auto w-full">
                <TeamCard
                  key={`teamId-${index}`}
                  id={`teamId-${index}`}
                  leaderUsername="이주훈"
                  leaderAvatarUrl="https://github.com/gym.png"
                  positions={["초보 환영", "재활·통증 케어", "다이어트"]}
                  teamDescription="맞춤형 8주 트레이닝"
                />
              </MagicCard>
            </BlurFade>
          ))}

        </div>
      </div>
    </BlurFade>
  );
}