import { Hero } from "@/components/common/Hero";
import CardSection from "@/components/product/teams/detail/CardSection";
import SideCard from "@/components/product/teams/detail/SideCard";

export default function TeamsDetail() {
  return (
    <div className="space-y-20">
      <Hero title="트레이너 이름의 팀" />
      <div className="grid grid-cols-6 gap-40 items-start p-5">
        <CardSection />
        <SideCard />
      </div>
    </div>
  );
}