import HeroSection from "@/app/components/HeroSection";
import SlideSection from "@/app/components/SlideSection";
import TrainerSection from "@/app/components/TrainerSection";
import IdeasSection from "@/app/components/GymSection";
import CommunitySection from "@/app/components/CommunitySection";
import PartnerSection from "@/app/components/PartnerSection";
import TeamSection from "@/app/components/TeamSection";

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
