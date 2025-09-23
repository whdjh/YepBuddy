import { Hero } from "@/components/common/Hero";
import CardSection from "@/app/teams/components/CardSection";
import { mockTeamCards } from "@/mock/teamsCardData";

export default function TeamsPage() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="회원 모집 공고" subtitle="회원 모집 공고 목록" />
      <CardSection cards={mockTeamCards} />
    </div>
  );
}