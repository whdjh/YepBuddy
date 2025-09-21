import Link from "next/link";
import PostCard from "@/components/common/Card/PostCard";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";

export default function CommunitySection() {
  return (
    <BlurFade delay={0.25} duration={1} inView>
      <div className="space-y-10 grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-10">
        <div className="self-center text-center md:text-left">
          <h2 className="md:text-5xl text-3xl font-bold leading-tight tracking-tight ">
            커뮤니티 최신 글
          </h2>
          <p className="max-w-2xl md:text-xl font-light text-foreground">
            방금 올라온 이야기들을 확인해보세요!
          </p>
          <Button variant="link" asChild className="text-lg p-0">
            <Link href="/community">커뮤니티 전체 보기 &rarr;</Link>
          </Button>
        </div>
        <div className="relative col-span-2 flex flex-col md:[perspective:500px] md:pb-40  overflow-hidden md:*:[transform:translateZ(-0px)_rotateY(-20deg)_rotateZ(10deg)]">
          <div className="relative col-span-2 flex flex-col md:[perspective:800px] md:[transform-style:preserve-3d] md:pb-40 overflow-hidden md:*:[transform:translateZ(-0px)_rotateY(-20deg)_rotateZ(10deg)]">
            <Marquee pauseOnHover className="[--duration:30s] hidden md:flex items-stretch [--gap:1.25rem]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`post-1-${index}`}
                  className="shrink-0 w-[320px] md:w-[360px]"
                >
                  <div className="h-full overflow-hidden rounded-2xl border border-white/10">
                    <PostCard
                      id={`postId-${index}`}
                      title="오늘 등했는데 어때?"
                      author="이주훈"
                      authorAvatarUrl="https://github.com/gym.png"
                      category="Productivity"
                      postedAt="12 hours ago"
                    />
                  </div>
                </div>
              ))}
            </Marquee>

            <Marquee pauseOnHover reverse className="[--duration:30s] hidden md:flex items-stretch [--gap:1.25rem]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`post-2-${index}`} className="shrink-0 w-[320px] md:w-[360px]">
                  <div className="h-full overflow-hidden rounded-2xl border border-white/10">
                    <PostCard
                      id={`postId-${index}`}
                      title="오늘 등했는데 어때?"
                      author="이주훈"
                      authorAvatarUrl="https://github.com/gym.png"
                      category="Productivity"
                      postedAt="12 hours ago"
                    />
                  </div>
                </div>
              ))}
            </Marquee>

            <Marquee pauseOnHover className="[--duration:30s] hidden md:flex items-stretch [--gap:1.25rem]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`post-3-${index}`} className="shrink-0 w-[320px] md:w-[360px]">
                  <div className="h-full overflow-hidden rounded-2xl border border-white/10">
                    <PostCard
                      id={`postId-${index}`}
                      title="오늘 등했는데 어때?"
                      author="이주훈"
                      authorAvatarUrl="https://github.com/gym.png"
                      category="Productivity"
                      postedAt="12 hours ago"
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