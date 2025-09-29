import Link from "next/link";
import { Button } from "@/components/ui/button";
import GymCard from "@/components/common/Card/GymCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

export default function GymsSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="space-y-10 relative tab:h-[50vh] flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute tab:relative flex flex-col justify-center items-center tab:p-64 z-50 text-center tab:text-left">
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="w-[30rem] h-[30rem] tab:w-[37rem] tab:h-[37rem] rounded-full bg-black/90" />
          </div>
          <h2 className="z-20 tab:text-5xl text-2xl font-bold leading-tight tracking-tight">
            헬스장
          </h2>
          <p className="z-20 max-w-2xl tab:text-xl text-md font-light text-foreground">
            헬스장의 내부 머신들이 무엇이 있는지 확인하세요
          </p>
          <Button variant="link" asChild className="z-20 tab:text-lg text-sm p-0">
            <Link href="/ideas">헬스장 전체 보기 &rarr;</Link>
          </Button>
        </div>
        <div className="tab:absolute inset-0 grid grid-cols-2 tab:grid-cols-3 pc:grid-cols-4 tab:h-full h-[75vh]">
          <Marquee
            pauseOnHover
            vertical
            className="[--duration:80s] flex flex-1"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <GymCard
                key={`gym-${index}`}
                id={`gym-${index}`}
                title="헬스장명"
                viewsCount={123}
                postedAt="2시간전"
                likesCount={12}
                claimed={index % 2 === 0}
              />
            ))}
          </Marquee>
          <Marquee
            pauseOnHover
            vertical
            reverse
            className="[--duration:80s] flex flex-1"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <GymCard
                key={`gym-${index}`}
                id={`gym-${index}`}
                title="헬스장명"
                viewsCount={123}
                postedAt="2시간전"
                likesCount={12}
                claimed={index % 2 === 0}
              />
            ))}
          </Marquee>
          <Marquee
            pauseOnHover
            vertical
            className="[--duration:80s] flex flex-1"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <GymCard
                key={`gym-${index}`}
                id={`gym-${index}`}
                title="헬스장명"
                viewsCount={123}
                postedAt="2시간전"
                likesCount={12}
                claimed={index % 2 === 0}
              />
            ))}
          </Marquee>
          <Marquee
            pauseOnHover
            vertical
            reverse
            className="[--duration:80s] flex flex-1"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <GymCard
                key={`gym-${index}`}
                id={`gym-${index}`}
                title="헬스장명"
                viewsCount={123}
                postedAt="2시간전"
                likesCount={12}
                claimed={index % 2 === 0}
              />
            ))}
          </Marquee>
        </div>
      </div>
    </BlurFade>
  );
}