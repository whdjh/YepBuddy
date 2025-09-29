import AssistanceSection from "@/app/components/AssistanceSection";
import TrainerSection from "@/app/components/TrainerSection";
import GymSection from "@/app/components/GymSection";

export default function Home() {
  return (
    <div className="pt-0 tab:pt-5 px-5 tab:px-20 space-y-20">
      <AssistanceSection />
      <TrainerSection />
      <GymSection />
    </div >
  );
}
