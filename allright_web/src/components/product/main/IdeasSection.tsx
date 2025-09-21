import Link from "next/link";
import { Button } from "@/components/ui/button";
import IdeaCard from "@/components/common/Card/IdeaCard";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

export default function IdeasSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="space-y-10 relative md:h-[50vh] flex flex-col justify-center items-center overflow-hidden">
        <div className="relative flex flex-col justify-center items-center md:p-64 z-50 text-center md:text-left">
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="w-[37rem] h-[37rem] rounded-full bg-black/90" />
          </div>
          <h2 className="z-20 md:text-5xl text-3xl font-bold leading-tight tracking-tight">
            IdeasGPT
          </h2>
          <p className="z-20 max-w-2xl md:text-xl font-light text-foreground">
            나만의 운동 루틴을 상품으로 판매하세요. GPT가 만든 루틴도, 직접 만든 루틴도 손쉽게 등록할 수 있어요.
          </p>
          <Button variant="link" asChild className="z-20 text-lg p-0">
            <Link href="/ideas">운동루틴 전체 보기 &rarr;</Link>
          </Button>
        </div>
        <div className="md:absolute w-full flex justify-between md:h-full h-[75vh]  top-0 left-0">
          <Marquee
            pauseOnHover
            vertical
            className="[--duration:80s] flex"
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
            className="[--duration:80s] flex"
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
            className="[--duration:80s] flex"
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
            className="[--duration:80s] flex"
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