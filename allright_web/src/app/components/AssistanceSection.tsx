import { BlurFade } from "@/components/ui/blur-fade";
import { BellIcon, CalendarIcon, MonitorSpeakerIcon, TabletSmartphoneIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import ProteinCard from "@/components/common/Card/ProteinCard";

const utc = (y: number, m: number, d: number) =>
  new Date(Date.UTC(y, m, d, 0, 0, 0));

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
                title={`마이프로틴`}
                weigth={`2.5kg`}
                authorAvatarUrl=""
                topic={
                  ["WPC", "WPI", "WPC+WPI", "카제인"][index % 4]
                }
              />
            </div>
          </div>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: CalendarIcon,
    name: "운동일지",
    description: "운동일지를 확인해보세요!",
    href: "/diary",
    cta: "운동일지 페이지로 이동하기",
    className: "col-span-3 tab:col-span-2",
    background: (
      <Calendar
        mode="single"
        selected={utc(2022, 4, 11)}
        className="absolute top-10 right-80 origin-top scale-75 rounded-md border [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
      />
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

export default function AssistanceSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="rounded-lg border border-white/10 overflow-hidden shadow-xl group">
        <BentoGrid>
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </BlurFade>
  );
}
