import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import TrainerCard from "@/components/common/Card/TrainerCard";
import { Button } from "@/components/ui/button";

export default function TrainerSection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="grid grid-cols-1 tab:grid-cols-3 gap-4">
        <div>
          <h2 className="text-3xl pc:text-5xl font-bold leading-tight tracking-tight">
            인기 트레이너
          </h2>
          <p className="text-md pc:text-xl font-light text-foreground">
            오늘 가장 주목받는 트레이너를 만나보세요!
          </p>
          <Button variant="link" asChild className="text-sm pc:text-lg px-0">
            <Link href="/trainer/leaderboards">트레이너 전체 보기 &rarr;</Link>
          </Button>
        </div>
        {Array.from({ length: 8 }).map((_, index) => (
          <TrainerCard
            key={`${index}`}
            id={`${index}`}
            name="트레이너명"
            description="프로그램소개"
            commentsCount={12}
            viewsCount={12}
            votesCount={120}
          />
        ))}
      </div>
    </BlurFade>
  );
}