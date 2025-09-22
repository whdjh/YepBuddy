import { Hero } from "@/components/common/Hero";
import CardSection from "@/components/product/teams/detail/CardSection";
import SideCard from "@/components/product/teams/detail/SideCard";

export default function TeamsDetail() {
  return (
    <div className="space-y-20 p-2 tab:p-5">
      <Hero title="트레이너 이름의 팀" />
      <div className="grid grid-cols-1 tab:grid-cols-6 gap-10 tab:gap-40 items-start p-5">
        <div className="col-span-full tab:col-span-4">
          <CardSection />
        </div>

        <div className="col-span-full tab:col-span-2">
          <SideCard />
        </div>
      </div>
    </div>
  );
}
