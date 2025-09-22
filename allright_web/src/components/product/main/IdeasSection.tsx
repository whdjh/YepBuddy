import Link from "next/link";
import { Button } from "@/components/ui/button";
import IdeaCard from "@/components/common/Card/IdeaCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

export default function IdeasSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="space-y-10 relative tab:h-[50vh] flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute tab:relative flex flex-col justify-center items-center tab:p-64 z-50 text-center tab:text-left">
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="w-[30rem] h-[30rem] tab:w-[37rem] tab:h-[37rem] rounded-full bg-black/90" />
          </div>
          <h2 className="z-20 tab:text-5xl text-2xl font-bold leading-tight tracking-tight">
            IdeasGPT
          </h2>
          <p className="z-20 max-w-2xl tab:text-xl text-md font-light text-foreground">
            나만의 운동 루틴을 상품으로 판매하세요. GPT가 만든 루틴도, 직접 만든 루틴도 손쉽게 등록할 수 있어요.
          </p>
          <Button variant="link" asChild className="z-20 tab:text-lg text-sm p-0">
            <Link href="/ideas">운동루틴 전체 보기 &rarr;</Link>
          </Button>
        </div>
        <div className="tab:absolute inset-0 grid grid-cols-2 tab:grid-cols-3 pc:grid-cols-4 tab:h-full h-[75vh]">
          <Marquee
            pauseOnHover
            vertical
            className="[--duration:80s] flex flex-1"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <IdeaCard
                key={`ideaId-${index}`}
                id={`ideaId-${index}`}
                title="A startup that creates an AI-powered generated personal trainer, delivering customized fitness recommendations and tracking of progress using a mobile app to track workouts and progress as well as a website to manage the business."
                viewsCount={123}
                postedAt="12 hours ago"
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
              <IdeaCard
                key={`ideaId-${index}`}
                id={`ideaId-${index}`}
                title="A startup that creates an AI-powered generated personal trainer, delivering customized fitness recommendations and tracking of progress using a mobile app to track workouts and progress as well as a website to manage the business."
                viewsCount={123}
                postedAt="12 hours ago"
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
              <IdeaCard
                key={`ideaId-${index}`}
                id={`ideaId-${index}`}
                title="A startup that creates an AI-powered generated personal trainer, delivering customized fitness recommendations and tracking of progress using a mobile app to track workouts and progress as well as a website to manage the business."
                viewsCount={123}
                postedAt="12 hours ago"
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
              <IdeaCard
                key={`ideaId-${index}`}
                id={`ideaId-${index}`}
                title="A startup that creates an AI-powered generated personal trainer, delivering customized fitness recommendations and tracking of progress using a mobile app to track workouts and progress as well as a website to manage the business."
                viewsCount={123}
                postedAt="12 hours ago"
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