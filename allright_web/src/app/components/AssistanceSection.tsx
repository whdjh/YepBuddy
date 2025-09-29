import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { RetroGrid } from "@/components/ui/retro-grid";

export default function AssistanceSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="rounded-lg border border-white/10 overflow-hidden -mt-20 shadow-xl group">
        <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden">
          <div className="flex relative z-10 bg-background w-full justify-center items-center flex-col -mt-24">
            <h2 className="tab:text-5xl text-3xl font-bold leading-tight tracking-tight ">
              파트너 최신글
            </h2>
            <p className="max-w-2xl tab:text-xl font-light text-foreground">
              운동 파트너를 구해보세요!
            </p>
            <Button variant="link" asChild className="text-lg p-0">
              <Link href="/ideas">파트너 전체 보기 &rarr;</Link>
            </Button>
          </div>
          <RetroGrid />
        </div>
        {/** 운동보조(bentogrid: 상좌: 운동템포 상우: 단백질카드 하좌: 운동일지 하우: 운동템포) */ }
      </div>
    </BlurFade>
  );
}