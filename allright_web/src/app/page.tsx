import HeroSection from "@/app/components/HeroSection";
import SlideSection from "@/app/components/SlideSection";
import TrainerSection from "@/app/components/TrainerSection";
import GymSection from "@/app/components/GymSection";
import AssistanceSection from "@/app/components/AssistanceSection";

export default function Home() {
  return (
    <div className="pt-0 tab:pt-5 px-5 tab:px-20 space-y-20">
      <HeroSection />
      <SlideSection />
      <TrainerSection />
      <GymSection />
      <AssistanceSection />
    </div >
  );
}
