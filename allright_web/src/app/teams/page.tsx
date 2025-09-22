import { Hero } from "@/components/common/Hero";
import CardSection from "@/components/product/teams/CardSection";
import { mockTeamCards } from "@/mock/teamsCardData";

export default function TeamsPage() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="회원모집" subtitle="피티를 맡길 트레이너를 찾아보세요!" />
      <CardSection cards={mockTeamCards} />
    </div>
  );
}