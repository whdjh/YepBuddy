import Link from "next/link";
import GymCard from "@/components/common/Card/GymCard";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

export default function GymSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="space-y-10 grid grid-cols-1 tab:grid-cols-3 gap-0 tab:gap-10">
        <div className="flex flex-col justify-center items-center self-center text-center tab:text-left">
          <h2 className="tab:text-4xl text-2xl font-bold leading-tight tracking-tight whitespace-nowrap">
            헬스장
          </h2>
          <p className="max-w-2xl tab:text-lg text-md font-light text-foreground">
            내부 머신을 쉽게 찾아보세요!
          </p>
          <Button variant="link" asChild className="text-lg p-0">
            <Link href="/community">헬스장 전체 보기 &rarr;</Link>
          </Button>
        </div>
        <div className="relative col-span-2 flex flex-col tab:[perspective:500px] tab:pb-40  overflow-hidden tab:*:[transform:translateZ(-0px)_rotateY(-20deg)_rotateZ(10deg)]">
          <div className="relative col-span-2 flex flex-col tab:[perspective:800px] tab:[transform-style:preserve-3d] tab:pb-40 overflow-hidden tab:*:[transform:translateZ(-0px)_rotateY(-20deg)_rotateZ(10deg)]">
            <Marquee pauseOnHover className="[--duration:30s] flex tab:flex items-stretch [--gap:1.25rem]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`post-1-${index}`}
                  className="shrink-0 w-[320px] tab:w-[360px]"
                >
                  <div className="h-full overflow-hidden rounded-2xl border border-white/10">
                    <GymCard
                      key={`gym-${index}`}
                      id={`gym-${index}`}
                      title="헬스장명"
                      viewsCount={123}
                      postedAt="2시간전"
                      likesCount={12}
                    />
                  </div>
                </div>
              ))}
            </Marquee>

            <Marquee pauseOnHover reverse className="[--duration:30s] flex tab:flex items-stretch [--gap:1.25rem]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`post-2-${index}`} className="shrink-0 w-[320px] tab:w-[360px]">
                  <div className="h-full overflow-hidden rounded-2xl border border-white/10">
                    <GymCard
                      key={`gym-${index}`}
                      id={`gym-${index}`}
                      title="헬스장명"
                      viewsCount={123}
                      postedAt="2시간전"
                      likesCount={12}
                    />
                  </div>
                </div>
              ))}
            </Marquee>

            <Marquee pauseOnHover className="[--duration:30s] flex tab:flex items-stretch [--gap:1.25rem]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`post-3-${index}`} className="shrink-0 w-[320px] tab:w-[360px]">
                  <div className="h-full overflow-hidden rounded-2xl border border-white/10">
                    <GymCard
                      key={`gym-${index}`}
                      id={`gym-${index}`}
                      title="헬스장명"
                      viewsCount={123}
                      postedAt="2시간전"
                      likesCount={12}
                    />
                  </div>
                </div>
              ))}
            </Marquee>
          </div>

        </div>
      </div>

    </BlurFade>
  );
}