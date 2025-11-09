import { BlurFade } from "@/components/ui/blur-fade";
import { BellIcon, Archive, MonitorSpeakerIcon, TabletSmartphoneIcon } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import ProteinCard from "@/app/protein/components/ProteinCard";
import GymCard from "@/app/gym/components/GymCard";

const features = [
  {
    Icon: MonitorSpeakerIcon,
    name: "운동템포(PC)",
    description: "세밀한 템포조절을 해보세요!",
    href: "/tempoauto",
    cta: "운동템포 페이지로 이동하기",
    className: "col-span-3 tab:col-span-1",
    background: null,
  },
  {
    Icon: BellIcon,
    name: "단백질 비교",
    description: "실시간 단백질 가격 비교를 해보세요!",
    href: "/protein",
    cta: "단백질 가격 비교 페이지로 이동하기",
    className: "col-span-3 tab:col-span-2",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`post-1-${index}`}
            className="shrink-0 w-[320px] tab:w-[360px]"
          >
            <div className="h-full overflow-hidden rounded-2xl border border-white/10">
              <ProteinCard
                key={`${index}`}
                id={`${index}`}
                title="마이프로틴"
                weight="2.5kg"
                avatarFile=""
              />
            </div>
          </div>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Archive,
    name: "헬스장",
    description: "헬스장 내부를 확인해보세요!",
    href: "/gym",
    cta: "헬스장 페이지로 이동하기",
    className: "col-span-3 tab:col-span-2",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`post-1-${index}`}
            className="shrink-0 w-[320px] tab:w-[360px]"
          >
            <div className="h-full overflow-hidden rounded-2xl border border-white/10">
              <GymCard
                key={`${index}`}
                id={`${index}`}
                title="헬스장명"
                location="헬스장위치"
              />
            </div>
          </div>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: TabletSmartphoneIcon,
    name: "운동템포(MOB)",
    description: "간단한 카운팅을 해보세요!",
    className: "col-span-3 tab:col-span-1",
    href: "/tempomanual",
    cta: "운동템포 페이지로 이동하기",
    background: null,
  },
] as const;

// TODO: 단백질, 헬스장 카드 실제 데이터로 변경 
// TODO: 운동템포에 대한 이미지 삽입 고민
export default function Home() {
  return (
    <div className="pt-0 tab:pt-5 px-5 tab:px-20 space-y-20">
      <BlurFade delay={0.25} duration={1} inView>
        <div className="rounded-lg border border-white/10 overflow-hidden shadow-xl group">
          <BentoGrid>
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </div>
      </BlurFade>
    </div >
  );
}
