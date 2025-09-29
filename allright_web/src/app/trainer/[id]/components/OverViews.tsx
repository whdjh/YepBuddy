import CardSection from "@/app/trainer/[id]/components/CardSection";
import SideCard from "@/app/trainer/[id]/components/SideCard";

export default function Overviews() {
  return (
    <div className="grid grid-cols-1 tab:grid-cols-6 gap-10 tab:gap-40 items-start p-5">
      <CardSection />
      <SideCard />
    </div>
  );
}
