import HeroSection from "@/components/product/main/HeroSection";
import SlideSection from "@/components/product/main/SlideSection";
import TrainerSection from "@/components/product/main/TrainerSection";
import IdeasSection from "@/components/product/main/IdeasSection";
import CommunitySection from "@/components/product/main/CommunitySection";
import PartnerSection from "@/components/product/main/PartnerSection";
import TeamSection from "@/components/product/main/TeamSection";

export default function Home() {
  return (
    <div className="pt-0 tab:pt-5 px-5 tab:px-20 space-y-20">
      <HeroSection />
      <SlideSection />
      <TrainerSection />
      <IdeasSection />
      <CommunitySection />
      <PartnerSection />
      <TeamSection />
    </div >
  );
}
