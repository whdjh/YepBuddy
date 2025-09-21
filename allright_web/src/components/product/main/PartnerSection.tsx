import Link from "next/link";
import { Button } from "@/components/ui/button";
import PartnerCard from "@/components/common/Card/PartnerCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { RetroGrid } from "@/components/ui/retro-grid";

export default function PartnerSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="rounded-lg border border-white/10 overflow-hidden -mt-20 shadow-xl group">
        <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
          <div className="flex relative z-10 bg-background w-full justify-center items-center flex-col -mt-24">
            <h2 className="md:text-5xl text-3xl font-bold leading-tight tracking-tight ">
              파트너 최신글
            </h2>
            <p className="max-w-2xl md:text-xl font-light text-foreground">
              운동 파트너를 구해보세요!
            </p>
            <Button variant="link" asChild className="text-lg p-0">
              <Link href="/ideas">파트너 전체 보기 &rarr;</Link>
            </Button>
          </div>
          <RetroGrid />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:p-10 p-5 -mt-32 md:-mt-14">
          {Array.from({ length: 9 }).map((_, index) => (
            <BlurFade
              delay={0.1 * index}
              duration={0.25}
              inView
              key={index}
            >
              <div className="group grid">
                <div className="transition duration-300
                  group-hover:[&:not(:hover)]:blur-sm
                  group-hover:[&:not(:hover)]:grayscale
                  hover:scale-105">
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
                </div>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </BlurFade>
  );
}