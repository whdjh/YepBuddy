import CardSection from "@/components/product/main/CardSection";

export default function Home() {
  return (
    <div className="px-20">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          <h2 className="text-5xl font-bold leading-tight tracking-tight">
            오늘의 <br />트레이너
          </h2>
          <p className="text-xl font-light text-foreground">
            오늘의 베스트 트레이너!
          </p>
        </div>
        {Array.from({ length: 10 }).map((_, index) => (
          <CardSection
            key={`trainer-${index}`}
            id={`trainerId-${index}`}
            name="트레이너 이름"
            description="트레이너 소개"
            commentsCount={12}
            viewsCount={12}
            votesCount={120}
          />
        ))}
      </div>
    </div >
  );
}
