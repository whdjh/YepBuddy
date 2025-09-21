import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { BlurFade } from "@/components/ui/blur-fade";

export default function HeroSection() {
  return (
    <div className="relative h-[500px] w-full flex justify-center items-center bg-background overflow-hidden ">
      <FlickeringGrid
        className="z-0 absolute inset-0 size-full"
        squareSize={4}
        gridGap={5}
        color="#16a34a"
        maxOpacity={0.5}
        flickerChance={0.2}
      />
      <div className="flex flex-col text-center md:space-y-5 items-center">
        <BlurFade delay={0.25} duration={1} inView>
          <h2 className="font-bold text-7xl">
            Allright에 오신걸 환영합니다!
          </h2>
        </BlurFade>
        <BlurFade delay={1} duration={1} inView>
          <span className="text-4xl">
            아래 운동 커뮤니티와 더불어 운동 일지 기록 및 운동 템포 조절해보세요!
          </span>
        </BlurFade>
      </div>
    </div>
  );
}